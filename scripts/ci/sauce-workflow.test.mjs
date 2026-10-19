import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  createGitHubApi,
  publishStatus,
  resolveTarget,
  resultStatus,
  runController,
  verifyCheckout,
} from './sauce-workflow.mjs';

const repository = 'infernojs/inferno';
const head = 'a'.repeat(40);
const base = 'b'.repeat(40);
const merge = 'c'.repeat(40);
const newer = 'd'.repeat(40);
const runUrl = `https://github.com/${repository}/actions/runs/123`;

function pullRequest() {
  return {
    number: 42,
    state: 'open',
    head: { sha: head, repo: { full_name: 'contributor/inferno' } },
    base: { ref: 'master', sha: base, repo: { full_name: repository } },
    user: { login: 'contributor' },
    mergeable: true,
    merge_commit_sha: merge,
  };
}

function dispatch() {
  return {
    eventName: 'workflow_dispatch',
    event: { inputs: { pr_number: '42', head_sha: head } },
    repository,
    ref: 'refs/heads/master',
    sha: base,
    actor: 'maintainer',
  };
}

function mockApi({ prs = [pullRequest()], parents = [base, head] } = {}) {
  const calls = [];
  let prReads = 0;
  const api = async (path, body) => {
    calls.push({ path, body });
    if (path === `repos/${repository}/pulls/42`) {
      return structuredClone(prs[Math.min(prReads++, prs.length - 1)]);
    }
    if (path === `repos/${repository}/git/ref/heads/master`) {
      return { object: { sha: base } };
    }
    if (path === `repos/${repository}/git/commits/${merge}`) {
      return { sha: merge, parents: parents.map((sha) => ({ sha })) };
    }
    if (path.startsWith(`repos/${repository}/statuses/`) && body) {
      return { ...body };
    }
    throw new Error(`Unexpected API request: ${path}`);
  };
  api.calls = calls;
  return api;
}

const target = { head_sha: head, base_sha: base, test_sha: merge };

test('a reviewed fork dispatch pins the current merge of its head and base', async () => {
  assert.deepEqual(await resolveTarget(dispatch(), mockApi()), target);
});

test('same-repository human PRs run automatically', async () => {
  const pr = pullRequest();
  pr.head.repo.full_name = repository;
  const context = {
    ...dispatch(),
    eventName: 'pull_request',
    ref: 'refs/pull/42/merge',
    event: { pull_request: pr },
  };
  assert.deepEqual(
    await resolveTarget(context, mockApi({ prs: [pr] })),
    target,
  );
});

test('forks and Dependabot require dispatch even when a maintainer reruns CI', async (t) => {
  for (const scenario of ['fork', 'dependabot author', 'dependabot actor']) {
    await t.test(scenario, async () => {
      const pr = pullRequest();
      if (scenario !== 'fork') pr.head.repo.full_name = repository;
      if (scenario === 'dependabot author') pr.user.login = 'dependabot[bot]';
      const api = mockApi();
      await assert.rejects(
        resolveTarget(
          {
            ...dispatch(),
            eventName: 'pull_request',
            event: { pull_request: pr },
            actor:
              scenario === 'dependabot actor'
                ? 'dependabot[bot]'
                : 'maintainer',
          },
          api,
        ),
        /require a maintainer dispatch/,
      );
      assert.equal(api.calls.length, 0);
    });
  }
});

test('master pushes test the pushed commit without resolving a PR', async () => {
  const api = mockApi();
  assert.deepEqual(
    await resolveTarget({ ...dispatch(), eventName: 'push' }, api),
    { head_sha: base, base_sha: '', test_sha: base },
  );
  assert.equal(api.calls.length, 0);
});

test('invalid approvals and unsupported triggers fail before API access', async (t) => {
  const cases = [
    ['wrong workflow branch', { ref: 'refs/heads/feature' }, /from master/],
    [
      'short SHA',
      { event: { inputs: { pr_number: '42', head_sha: 'abc123' } } },
      /40-character/,
    ],
    [
      'shell syntax in SHA',
      { event: { inputs: { pr_number: '42', head_sha: '$(touch unwanted)' } } },
      /40-character/,
    ],
    ['missing SHA', { event: { inputs: { pr_number: '42' } } }, /40-character/],
    [
      'invalid PR number',
      { event: { inputs: { pr_number: '42/../../statuses', head_sha: head } } },
      /positive integer/,
    ],
    [
      'zero PR number',
      { event: { inputs: { pr_number: '0', head_sha: head } } },
      /positive integer/,
    ],
    [
      'missing PR number',
      { event: { inputs: { head_sha: head } } },
      /positive integer/,
    ],
    [
      'privileged PR event',
      { eventName: 'pull_request_target' },
      /Unsupported event/,
    ],
    [
      'non-master push',
      { eventName: 'push', ref: 'refs/heads/feature' },
      /target master/,
    ],
  ];
  for (const [name, changes, error] of cases) {
    await t.test(name, async () => {
      const api = mockApi();
      await assert.rejects(
        resolveTarget({ ...dispatch(), ...changes }, api),
        error,
      );
      assert.equal(api.calls.length, 0);
    });
  }
});

test('closed, deleted, foreign, stale and conflicting PRs are rejected', async (t) => {
  const cases = [
    [
      'closed',
      (pr) => {
        pr.state = 'closed';
      },
      /must be open/,
    ],
    [
      'deleted fork',
      (pr) => {
        pr.head.repo = null;
      },
      /must be open/,
    ],
    [
      'foreign base',
      (pr) => {
        pr.base.repo.full_name = 'someone/else';
      },
      /target this repository/,
    ],
    [
      'new head',
      (pr) => {
        pr.head.sha = newer;
      },
      /head changed/,
    ],
    [
      'conflict',
      (pr) => {
        pr.mergeable = false;
      },
      /merge conflicts/,
    ],
  ];
  for (const [name, change, error] of cases) {
    await t.test(name, async () => {
      const pr = pullRequest();
      change(pr);
      const api = mockApi({ prs: [pr] });
      await assert.rejects(resolveTarget(dispatch(), api), error);
      assert.equal(api.calls.length, 1);
    });
  }
});

test('waits for GitHub to compute mergeability and checks the head again', async () => {
  const computing = {
    ...pullRequest(),
    mergeable: null,
    merge_commit_sha: null,
  };
  const waits = [];
  const wait = async (ms) => {
    waits.push(ms);
  };
  assert.deepEqual(
    await resolveTarget(
      dispatch(),
      mockApi({ prs: [computing, pullRequest()] }),
      wait,
    ),
    target,
  );
  assert.deepEqual(waits, [2_000]);

  const updated = pullRequest();
  updated.head.sha = newer;
  await assert.rejects(
    resolveTarget(dispatch(), mockApi({ prs: [computing, updated] }), wait),
    /head changed/,
  );
});

test('never accepts an unresolved merge or a merge with different parents', async (t) => {
  const cases = [
    ['unresolved', { prs: [{ ...pullRequest(), mergeable: null }] }],
    ['old base', { parents: [newer, head] }],
    ['unapproved head', { parents: [base, newer] }],
    ['reversed parents', { parents: [head, base] }],
    ['not a merge', { parents: [head] }],
  ];
  for (const [name, options] of cases) {
    await t.test(name, async () => {
      const api = mockApi(options);
      let waits = 0;
      await assert.rejects(
        resolveTarget(dispatch(), api, async () => {
          waits++;
        }),
        /not produced a current test merge/,
      );
      assert.equal(waits, 4);
      assert.equal(
        api.calls.filter(({ path }) => path.endsWith('/pulls/42')).length,
        5,
      );
    });
  }
});

test('checkout verification uses real commit identity and ordered merge parents', () => {
  const directory = mkdtempSync(join(tmpdir(), 'inferno-sauce-git-'));
  const git = (...args) =>
    execFileSync(
      'git',
      [
        '-c',
        'core.hooksPath=/dev/null',
        '-c',
        'commit.gpgsign=false',
        '-c',
        'user.name=CI test',
        '-c',
        'user.email=ci@example.invalid',
        '-C',
        directory,
        ...args,
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
  try {
    git('init', '--initial-branch=master');
    git('commit', '--allow-empty', '-m', 'Initial');
    git('checkout', '-b', 'feature');
    git('commit', '--allow-empty', '-m', 'Feature');
    const headSha = git('rev-parse', 'HEAD');
    git('checkout', 'master');
    git('commit', '--allow-empty', '-m', 'Base update');
    const baseSha = git('rev-parse', 'HEAD');
    git('merge', '--no-ff', 'feature', '-m', 'Test merge');
    const testSha = git('rev-parse', 'HEAD');
    const actual = { head_sha: headSha, base_sha: baseSha, test_sha: testSha };

    verifyCheckout(directory, actual);
    assert.throws(
      () => verifyCheckout(directory, { ...actual, test_sha: headSha }),
      /approved test SHA/,
    );
    assert.throws(
      () => verifyCheckout(directory, { ...actual, head_sha: baseSha }),
      /approved head and base/,
    );
    assert.throws(
      () => verifyCheckout(directory, { ...actual, base_sha: headSha }),
      /approved head and base/,
    );
    assert.throws(
      () => verifyCheckout(directory, { ...actual, base_sha: '' }),
      /pushed head SHA/,
    );
    verifyCheckout(directory, {
      head_sha: testSha,
      base_sha: '',
      test_sha: testSha,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('only a successful browser job can publish success', () => {
  assert.equal(resultStatus('success').state, 'success');
  assert.equal(resultStatus('failure').state, 'failure');
  for (const result of ['cancelled', 'skipped', 'timed_out', '', undefined]) {
    assert.equal(resultStatus(result).state, 'error');
  }
});

test('reports the PR head and tested merge, without using the dispatcher master SHA', async () => {
  const api = mockApi();
  await publishStatus(api, repository, target, resultStatus('success'), runUrl);
  assert.deepEqual(
    api.calls,
    [merge, head].map((sha) => ({
      path: `repos/${repository}/statuses/${sha}`,
      body: {
        state: 'success',
        description: 'All Sauce Labs browsers passed.',
        context: 'Sauce Labs',
        target_url: runUrl,
      },
    })),
  );
});

test('push status is published once and status API errors propagate', async () => {
  const api = mockApi();
  await publishStatus(
    api,
    repository,
    { head_sha: head, test_sha: head },
    resultStatus('failure'),
    runUrl,
  );
  assert.equal(api.calls.length, 1);
  await assert.rejects(
    publishStatus(
      async () => {
        throw new Error('API unavailable');
      },
      repository,
      target,
      resultStatus('success'),
      runUrl,
    ),
    /API unavailable/,
  );
});

function controllerEnv(t, event = dispatch().event) {
  const directory = mkdtempSync(join(tmpdir(), 'inferno-sauce-controller-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const eventPath = join(directory, 'event.json');
  const outputPath = join(directory, 'output');
  writeFileSync(eventPath, JSON.stringify(event));
  writeFileSync(outputPath, '');
  return {
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_EVENT_PATH: eventPath,
    GITHUB_REPOSITORY: repository,
    GITHUB_REF: 'refs/heads/master',
    GITHUB_SHA: base,
    GITHUB_ACTOR: 'maintainer',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_RUN_ID: '123',
    GITHUB_OUTPUT: outputPath,
    GITHUB_STEP_SUMMARY: join(directory, 'summary'),
    HEAD_SHA: head,
    TEST_SHA: merge,
  };
}

test('prepare publishes pending before allowing browser execution; report completes both statuses', async (t) => {
  const env = controllerEnv(t);
  const api = mockApi();
  await runController('prepare', env, api);
  assert.equal(
    readFileSync(env.GITHUB_OUTPUT, 'utf8'),
    `head_sha=${head}\nbase_sha=${base}\ntest_sha=${merge}\n`,
  );
  assert.deepEqual(
    api.calls.filter(({ body }) => body).map(({ body }) => body.state),
    ['pending', 'pending'],
  );
  await runController('report', { ...env, BROWSER_RESULT: 'cancelled' }, api);
  assert.deepEqual(
    api.calls.filter(({ body }) => body).map(({ body }) => body.state),
    ['pending', 'pending', 'error', 'error'],
  );
});

test('stale approval and failed pending status cannot release browser job outputs', async (t) => {
  const env = controllerEnv(t);
  const stale = pullRequest();
  stale.head.sha = newer;
  const api = mockApi({ prs: [stale] });
  await assert.rejects(runController('prepare', env, api), /head changed/);
  assert.equal(api.calls.filter(({ body }) => body).length, 0);
  assert.equal(readFileSync(env.GITHUB_OUTPUT, 'utf8'), '');

  const workingApi = mockApi();
  await assert.rejects(
    runController('prepare', env, async (path, body) => {
      if (body) throw new Error('Cannot publish pending');
      return workingApi(path);
    }),
    /Cannot publish pending/,
  );
  assert.equal(readFileSync(env.GITHUB_OUTPUT, 'utf8'), '');
});

test('GitHub client scopes authentication to API calls and fails on denied requests', async () => {
  const calls = [];
  const api = createGitHubApi({
    token: 'test-token',
    apiUrl: 'https://api.github.com',
    fetchImpl: async (...args) => {
      calls.push(args);
      return { ok: true, json: async () => ({ state: 'pending' }) };
    },
  });
  await api(`repos/${repository}/statuses/${head}`, { state: 'pending' });
  assert.equal(
    calls[0][0],
    `https://api.github.com/repos/${repository}/statuses/${head}`,
  );
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].headers.Authorization, 'Bearer test-token');
  assert.deepEqual(JSON.parse(calls[0][1].body), { state: 'pending' });

  const denied = createGitHubApi({
    token: 'test-token',
    apiUrl: 'https://api.github.com',
    fetchImpl: async () => ({ ok: false, status: 403 }),
  });
  await assert.rejects(denied('repos/infernojs/inferno'), /failed \(403\)/);
  assert.throws(
    () => createGitHubApi({ apiUrl: 'https://api.github.com' }),
    /GH_TOKEN is required/,
  );
});
