// This controller runs from master, separately from the PR's install/test code.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

export const statusContext = 'Sauce Labs';

function requireSha(value, name) {
  if (typeof value !== 'string' || !/^[a-f0-9]{40}$/i.test(value)) {
    throw new Error(`${name} must be a full 40-character commit SHA.`);
  }
  return value.toLowerCase();
}

export function createGitHubApi({ token, apiUrl, fetchImpl = fetch }) {
  if (!token) {
    throw new Error('GH_TOKEN is required for status reporting.');
  }
  return async (path, body) => {
    const response = await fetchImpl(`${apiUrl}/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(
        `GitHub API request to ${path} failed (${response.status}).`,
      );
    }
    return response.json();
  };
}

export async function resolveTarget(context, api, wait = delay) {
  const { eventName, event, repository, ref, sha, actor } = context;
  let number;
  let headSha;

  if (eventName === 'push') {
    if (ref !== 'refs/heads/master') {
      throw new Error('Automatic push runs must target master.');
    }
    const commit = requireSha(sha, 'Push SHA');
    return { head_sha: commit, base_sha: '', test_sha: commit };
  }

  if (eventName === 'workflow_dispatch') {
    if (ref !== 'refs/heads/master') {
      throw new Error('Dispatch the Sauce Labs workflow from master.');
    }
    number = event.inputs?.pr_number;
    headSha = requireSha(event.inputs?.head_sha, 'Reviewed head SHA');
  } else if (eventName === 'pull_request') {
    const pr = event.pull_request;
    if (
      pr?.head.repo?.full_name !== repository ||
      pr?.user.login === 'dependabot[bot]' ||
      actor === 'dependabot[bot]'
    ) {
      throw new Error('Fork and Dependabot PRs require a maintainer dispatch.');
    }
    number = String(pr.number);
    headSha = requireSha(pr.head.sha, 'PR head SHA');
  } else {
    throw new Error(`Unsupported event: ${eventName}.`);
  }

  if (typeof number !== 'string' || !/^[1-9][0-9]*$/.test(number)) {
    throw new Error('pr_number must be a positive integer.');
  }

  const repoPath = `repos/${repository}`;
  // GitHub computes mergeability asynchronously; do not use an old merge ref.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await wait(2_000);
    }
    const pr = await api(`${repoPath}/pulls/${number}`);
    if (pr.state !== 'open' || !pr.head.repo) {
      throw new Error(
        'The PR must be open and its head repository must exist.',
      );
    }
    if (pr.base.repo.full_name !== repository) {
      throw new Error('The PR must target this repository.');
    }
    if (pr.head.sha !== headSha) {
      throw new Error('The PR head changed. Review and dispatch the new SHA.');
    }
    if (pr.mergeable === false) {
      throw new Error(
        'Resolve the PR merge conflicts before running Sauce Labs.',
      );
    }
    if (pr.mergeable !== true || !pr.merge_commit_sha) {
      continue;
    }

    const testSha = requireSha(pr.merge_commit_sha, 'Test merge SHA');
    const base = await api(
      `${repoPath}/git/ref/heads/${encodeURIComponent(pr.base.ref)}`,
    );
    const baseSha = requireSha(base.object.sha, 'Base SHA');
    const merge = await api(`${repoPath}/git/commits/${testSha}`);
    if (
      merge.sha === testSha &&
      merge.parents.length === 2 &&
      merge.parents[0].sha === baseSha &&
      merge.parents[1].sha === headSha
    ) {
      return { head_sha: headSha, base_sha: baseSha, test_sha: testSha };
    }
  }
  throw new Error(
    'GitHub has not produced a current test merge. Try again later.',
  );
}

export function verifyCheckout(directory, target) {
  const testSha = requireSha(target.test_sha, 'Test SHA');
  const headSha = requireSha(target.head_sha, 'Head SHA');
  const git = (...args) =>
    execFileSync('git', ['-C', directory, ...args], {
      encoding: 'utf8',
    }).trim();

  if (git('rev-parse', 'HEAD') !== testSha) {
    throw new Error('The checkout does not match the approved test SHA.');
  }
  if (target.base_sha) {
    const baseSha = requireSha(target.base_sha, 'Base SHA');
    if (git('show', '-s', '--format=%P', 'HEAD') !== `${baseSha} ${headSha}`) {
      throw new Error(
        'The checkout does not merge the approved head and base.',
      );
    }
  } else if (testSha !== headSha) {
    throw new Error('A push checkout must match the pushed head SHA.');
  }
}

export function resultStatus(result) {
  if (result === 'success') {
    return { state: 'success', description: 'All Sauce Labs browsers passed.' };
  }
  if (result === 'failure') {
    return {
      state: 'failure',
      description: 'The Sauce Labs browser job failed.',
    };
  }
  return {
    state: 'error',
    description:
      'The Sauce Labs browser job was cancelled or did not complete.',
  };
}

export async function publishStatus(api, repository, target, status, runUrl) {
  const testSha = requireSha(target.test_sha, 'Test SHA');
  const headSha = requireSha(target.head_sha, 'Head SHA');
  // GitHub can evaluate checks on either the test merge or the PR head.
  for (const commit of new Set([testSha, headSha])) {
    await api(`repos/${repository}/statuses/${commit}`, {
      ...status,
      context: statusContext,
      target_url: runUrl,
    });
  }
}

export async function runController(command, env, api) {
  const target = {
    head_sha: env.HEAD_SHA,
    base_sha: env.BASE_SHA,
    test_sha: env.TEST_SHA,
  };
  if (command === 'verify-checkout') {
    verifyCheckout(env.SOURCE_DIRECTORY, target);
    console.info(`Verified test revision ${target.test_sha}.`);
    return;
  }

  api ??= createGitHubApi({ token: env.GH_TOKEN, apiUrl: env.GITHUB_API_URL });
  const runUrl = `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;
  if (command === 'prepare') {
    const resolved = await resolveTarget(
      {
        eventName: env.GITHUB_EVENT_NAME,
        event: JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')),
        repository: env.GITHUB_REPOSITORY,
        ref: env.GITHUB_REF,
        sha: env.GITHUB_SHA,
        actor: env.GITHUB_ACTOR,
      },
      api,
    );
    await publishStatus(
      api,
      env.GITHUB_REPOSITORY,
      resolved,
      { state: 'pending', description: 'Running Sauce Labs browser tests.' },
      runUrl,
    );
    appendFileSync(
      env.GITHUB_OUTPUT,
      Object.entries(resolved)
        .map(([key, value]) => `${key}=${value}\n`)
        .join(''),
    );
    appendFileSync(
      env.GITHUB_STEP_SUMMARY,
      `Reviewed head: \`${resolved.head_sha}\`\n\nTest revision: \`${resolved.test_sha}\`\n`,
    );
  } else if (command === 'report') {
    await publishStatus(
      api,
      env.GITHUB_REPOSITORY,
      target,
      resultStatus(env.BROWSER_RESULT),
      runUrl,
    );
  } else {
    throw new Error(`Unknown controller command: ${command}.`);
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runController(process.argv[2], process.env).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
