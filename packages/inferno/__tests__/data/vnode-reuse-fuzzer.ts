import {
  Component,
  createComponentVNode,
  createFragment,
  createPortal,
  createTextVNode,
  createVNode,
  render,
  rerender,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

/*
 * Differential tests for vNode reuse.
 *
 * A sequence of tree descriptions is rendered twice:
 * - "shared" run builds pool vNodes once and puts the same vNode objects into many places, and across renders
 * - "fresh" run builds new vNodes from the same descriptions for every render
 * Both runs must end up with the same DOM, create the same DOM nodes and mount the same components.
 */

// Children of normalized parents, same values JSX expressions can have
export type Raw = Desc | string | null | Raw[];

export type Children =
  | { flags: 'none' }
  | { flags: 'text'; text: string }
  | { flags: 'single'; child: Desc }
  | { flags: 'nonKeyed'; children: Desc[] }
  | { flags: 'keyed'; children: Desc[] }
  | { flags: 'unknown'; children: Raw };

export type Desc =
  | { t: 'text'; key: string | null; text: string }
  | { t: 'element'; key: string | null; tag: string; children: Children }
  | { t: 'fragment'; key: string | null; children: Children }
  | { t: 'portal'; target: number; child: Desc }
  // Class component rendering <section>{this.props.children}</section>
  | { t: 'box'; key: string | null; children: Raw }
  // Function component returning props.children
  | { t: 'wrap'; key: string | null; children: Raw }
  // Function component returning a vNode from the pool
  | { t: 'hoist'; key: string | null; id: number }
  // vNode from the pool
  | { t: 'shared'; id: number };

export type Step = { t: 'render'; tree: Desc } | { t: 'forceUpdate' };

function childFlagsOf(children: Children): ChildFlags {
  switch (children.flags) {
    case 'none':
      return ChildFlags.HasInvalidChildren;
    case 'text':
      return ChildFlags.HasTextChildren;
    case 'single':
      return ChildFlags.HasVNodeChildren;
    case 'nonKeyed':
      return ChildFlags.HasNonKeyedChildren;
    case 'keyed':
      return ChildFlags.HasKeyedChildren;
    default:
      return ChildFlags.UnknownChildren;
  }
}

export class Run {
  public readonly container: HTMLDivElement;
  public readonly portalTargets: HTMLDivElement[];
  public constructed = 0;
  public unmounted = 0;
  public readonly boxes = new Set<Component<any, any>>();
  private readonly pool: VNode[] = [];
  private readonly seen = new WeakSet<Node>();
  private readonly Box;
  private readonly Wrap;
  private readonly Hoist;

  constructor(
    private readonly poolDescs: Desc[],
    private readonly share: boolean,
  ) {
    this.container = document.createElement('div');
    this.portalTargets = [
      document.createElement('div'),
      document.createElement('div'),
    ];
    document.body.appendChild(this.container);

    const run = this;

    this.Box = class Box extends Component<any, any> {
      constructor(props) {
        super(props);
        run.constructed++;
        run.boxes.add(this);
      }

      public componentWillUnmount() {
        run.unmounted++;
        run.boxes.delete(this);
      }

      public render() {
        return createVNode(
          VNodeFlags.HtmlElement,
          'section',
          null,
          this.props.children,
          ChildFlags.UnknownChildren,
        );
      }
    };
    this.Wrap = function Wrap(props) {
      return props.children;
    };
    this.Hoist = function Hoist(props) {
      return run.shared(props.id);
    };
  }

  public shared(id: number): VNode {
    if (!this.share) {
      return this.build(this.poolDescs[id]);
    }
    if (this.pool[id] === undefined) {
      this.pool[id] = this.build(this.poolDescs[id]);
    }
    return this.pool[id];
  }

  public build(desc: Desc): VNode {
    switch (desc.t) {
      case 'text':
        return createTextVNode(desc.text, desc.key);
      case 'element':
        return createVNode(
          VNodeFlags.HtmlElement,
          desc.tag,
          null,
          this.buildChildren(desc.children),
          childFlagsOf(desc.children),
          null,
          desc.key,
        );
      case 'fragment':
        return createFragment(
          this.buildChildren(desc.children),
          childFlagsOf(desc.children),
          desc.key,
        );
      case 'portal':
        return createPortal(
          this.build(desc.child),
          this.portalTargets[desc.target],
        );
      case 'box':
        return createComponentVNode(
          VNodeFlags.ComponentClass,
          this.Box,
          { children: this.buildRaw(desc.children) },
          desc.key,
        );
      case 'wrap':
        return createComponentVNode(
          VNodeFlags.ComponentFunction,
          this.Wrap,
          { children: this.buildRaw(desc.children) },
          desc.key,
        );
      case 'hoist':
        return createComponentVNode(
          VNodeFlags.ComponentFunction,
          this.Hoist,
          { id: desc.id },
          desc.key,
        );
      default:
        return this.shared(desc.id);
    }
  }

  // Counts DOM nodes that were not in the DOM after the previous step
  public countNewNodes(): number {
    let count = 0;

    for (const root of [this.container, ...this.portalTargets]) {
      const walker = document.createTreeWalker(root, 5 /* elements and text */);
      let node: Node | null = walker.nextNode();

      while (node !== null) {
        if (!this.seen.has(node)) {
          this.seen.add(node);
          count++;
        }
        node = walker.nextNode();
      }
    }
    return count;
  }

  public html(): string {
    return [this.container, ...this.portalTargets]
      .map((element) => element.innerHTML)
      .join(' | ');
  }

  public destroy(): void {
    document.body.removeChild(this.container);
  }

  private buildChildren(children: Children): any {
    switch (children.flags) {
      case 'none':
        return null;
      case 'text':
        return children.text;
      case 'single':
        return this.build(children.child);
      case 'nonKeyed':
      case 'keyed':
        return children.children.map((child) => this.build(child));
      default:
        return this.buildRaw(children.children);
    }
  }

  private buildRaw(raw: Raw): any {
    if (raw === null || typeof raw === 'string') {
      return raw;
    }
    if (Array.isArray(raw)) {
      return raw.map((item) => this.buildRaw(item));
    }
    return this.build(raw);
  }
}

function applyStep(run: Run, step: Step): void {
  if (step.t === 'render') {
    render(run.build(step.tree), run.container);
  } else {
    for (const box of Array.from(run.boxes)) {
      box.forceUpdate();
    }
  }
  rerender();
}

function check(context: string, name: string, received, expected): void {
  if (received !== expected) {
    throw new Error(
      `${name} differs\nexpected: ${expected}\nreceived: ${received}\n${context}`,
    );
  }
}

// Adds the run and phase to errors, so that failures of the reference run are told apart
function attempt(context: string, label: string, callback: () => void): void {
  try {
    callback();
  } catch (e) {
    throw new Error(`${label}: ${String(e)}\n${context}`, { cause: e });
  }
}

/*
 * Renders the steps with shared and with fresh vNodes, and throws when DOM, created DOM nodes or mounted components differ,
 * or when the DOM differs from mounting the same tree. renderFirst renders the first step, for example by hydrating it.
 */
export function compareRuns(
  pool: Desc[],
  steps: Step[],
  label: string,
  renderFirst?: (run: Run, tree: Desc) => void,
): void {
  const shared = new Run(pool, true);
  const fresh = new Run(pool, false);
  let context = label;

  try {
    steps.forEach((step, i) => {
      context = `${label}, step ${i}\npool: ${JSON.stringify(pool)}\nsteps: ${JSON.stringify(steps.slice(0, i + 1))}`;

      for (const [run, name] of [
        [shared, 'shared run'],
        [fresh, 'fresh run'],
      ] as const) {
        attempt(context, name, () => {
          if (i === 0 && step.t === 'render' && renderFirst) {
            renderFirst(run, step.tree);
            rerender();
          } else {
            applyStep(run, step);
          }
        });
      }

      check(context, 'DOM', shared.html(), fresh.html());
      check(
        context,
        'created DOM nodes',
        shared.countNewNodes(),
        fresh.countNewNodes(),
      );
      check(
        context,
        'mounted components',
        shared.constructed,
        fresh.constructed,
      );
      check(context, 'unmounted components', shared.unmounted, fresh.unmounted);

      if (step.t === 'render') {
        const reference = new Run(pool, false);

        attempt(context, 'reference mount', () => {
          render(reference.build(step.tree), reference.container);
        });
        check(
          context,
          'DOM compared to mounting',
          shared.container.innerHTML,
          reference.container.innerHTML,
        );
        render(null, reference.container);
        reference.destroy();
      }
    });

    attempt(context, 'shared unmount', () => {
      render(null, shared.container);
    });
    attempt(context, 'fresh unmount', () => {
      render(null, fresh.container);
    });
    check(context, 'unmounted components', shared.unmounted, fresh.unmounted);
    check(context, 'DOM after unmount', shared.html(), ' |  | ');
    check(context, 'fresh DOM after unmount', fresh.html(), ' |  | ');
  } finally {
    shared.destroy();
    fresh.destroy();
  }
}
