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
 * Differential fuzzer for vNode reuse.
 *
 * A sequence of random tree descriptions is rendered twice:
 * - "shared" run builds pool vNodes once and puts the same vNode objects into many places, and across renders
 * - "fresh" run builds new vNodes from the same descriptions for every render
 * Both runs must end up with the same DOM, create the same DOM nodes and mount the same components.
 */

export type Random = () => number;

// mulberry32
export function createRandom(seed: number): Random {
  let state = seed | 0;

  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

export interface FuzzOptions {
  portals: boolean;
  // Only trees that server side rendering reproduces exactly: no portals and no adjacent text nodes
  hydratable: boolean;
}

const TAGS = ['div', 'p', 'span', 'b', 'i', 'ul', 'li'];
// HTML parser closes p and li elements implicitly, so server rendered HTML of nested ones differs from the vNodes
const HYDRATABLE_TAGS = ['div', 'span', 'b', 'i', 'ul'];
const KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

// Where a node is generated, decides which pool vNodes it can be
type Place = 'plain' | 'keyed' | 'portal' | 'array';

/*
 * Known limitations of reusing vNodes are not generated:
 * - Normalization gives an array item its key in place, and a vNode rendered with that key outside of arrays
 *   is replaced instead of patched. So pool vNodes 0-3 are never array items, pool vNodes 4-5 are only array items.
 * - Arrays with holes or nested arrays keep the key an item got from earlier normalization, which can collide
 *   with the keys of other items. So pool vNodes are items only of flat arrays.
 * - Key validation of nested non-keyed lists requires all or none of the vNodes to have keys.
 *   So keyed pool vNodes are used only in keyed lists.
 */
const DIRECT_IDS = [0, 1, 2, 3];
const ARRAY_IDS = [4, 5];

export class Generator {
  public readonly pool: Desc[] = [];
  private depth = 0;

  constructor(
    private readonly random: Random,
    private readonly options: FuzzOptions,
  ) {
    for (let id = 0; id < 6; ++id) {
      // Pool vNodes 0 and 2 have a key, those can be used only once in a keyed list
      this.pool.push(this.poolNode(id === 0 || id === 2 ? 'p' + id : null));
    }
  }

  public steps(count: number): Step[] {
    const steps: Step[] = [];

    for (let i = 0; i < count; ++i) {
      if (i > 0 && this.chance(0.2)) {
        steps.push({ t: 'forceUpdate' });
      } else {
        steps.push({ t: 'render', tree: this.root() });
      }
    }
    return steps;
  }

  private root(): Desc {
    // Root children list keeps its length so that parts of the tree are patched between steps
    const children: Desc[] = [];

    for (let i = 0; i < 3; ++i) {
      children.push(this.node(null, true, 'plain'));
    }
    return {
      t: 'element',
      key: null,
      tag: 'div',
      children: { flags: 'nonKeyed', children },
    };
  }

  private chance(probability: number): boolean {
    return this.random() < probability;
  }

  private pick<T>(items: T[]): T {
    return items[Math.floor(this.random() * items.length)];
  }

  private text(): string {
    return this.pick(['x', 'y', 'z']);
  }

  private poolNode(key: string | null): Desc {
    this.depth = 1;
    const desc = this.node(key, false, 'plain');
    this.depth = 0;

    return desc;
  }

  // Keys used in a list, keyed pool vNodes can be used only once per list
  private keys(count: number): Array<string | null> {
    const keys = KEYS.slice();
    const result: Array<string | null> = [];

    for (let i = 0; i < count; ++i) {
      result.push(keys.splice(Math.floor(this.random() * keys.length), 1)[0]);
    }
    return result;
  }

  private sharedId(place: Place, used: Set<number>): number | null {
    const ids = (place === 'array' ? ARRAY_IDS : DIRECT_IDS).filter((id) => {
      const key = this.poolKey(id);

      if (place === 'keyed') {
        return key !== null && !used.has(id);
      }
      return key === null;
    });

    if (ids.length === 0) {
      return null;
    }
    const id = this.pick(ids);

    used.add(id);
    return id;
  }

  // key is null for non-keyed positions, allowShared is false inside pool vNodes
  private node(
    key: string | null,
    allowShared: boolean,
    place: Place,
    used: Set<number> = new Set(),
  ): Desc {
    this.depth++;
    try {
      const leaf = this.depth > 3;

      if (allowShared && this.chance(0.3)) {
        const id = this.sharedId(place, used);

        if (id !== null) {
          return { t: 'shared', id };
        }
      }
      const roll = this.random();

      if (leaf || roll < 0.15) {
        if (this.options.hydratable) {
          return this.element(key, { flags: 'text', text: this.text() });
        }
        return { t: 'text', key, text: this.text() };
      }
      if (roll < 0.55) {
        return this.element(key, this.children(allowShared));
      }
      if (roll < 0.68) {
        return {
          t: 'fragment',
          key,
          children: this.children(allowShared, true),
        };
      }
      if (roll < 0.76 && this.options.portals && key === null) {
        return {
          t: 'portal',
          target: this.pick([0, 1]),
          child: this.node(null, allowShared, 'portal'),
        };
      }
      if (roll < 0.86) {
        return { t: 'box', key, children: this.raw(allowShared) };
      }
      if (roll < 0.94) {
        return { t: 'wrap', key, children: this.raw(allowShared) };
      }
      if (allowShared) {
        return { t: 'hoist', key, id: this.pick(DIRECT_IDS) };
      }
      return this.element(key, { flags: 'none' });
    } finally {
      this.depth--;
    }
  }

  // Portal takes the key of its child, which is always null here
  private poolKey(id: number): string | null {
    const desc = this.pool[id];

    return desc.t === 'portal' || desc.t === 'shared' ? null : desc.key;
  }

  private element(key: string | null, children: Children): Desc {
    return {
      t: 'element',
      key,
      tag: this.pick(this.options.hydratable ? HYDRATABLE_TAGS : TAGS),
      children,
    };
  }

  private list(count: number, keyed: boolean, allowShared: boolean): Desc[] {
    const used = new Set<number>();
    const keys = this.keys(count);
    const result: Desc[] = [];

    for (let i = 0; i < count; ++i) {
      result.push(
        this.node(
          keyed ? keys[i] : null,
          allowShared,
          keyed ? 'keyed' : 'plain',
          used,
        ),
      );
    }
    return result;
  }

  private children(allowShared: boolean, isFragment = false): Children {
    const roll = this.random();
    const count = 1 + Math.floor(this.random() * 4);

    // Hydration cannot tell adjacent text nodes apart
    if (roll < 0.1 && !isFragment) {
      return { flags: 'none' };
    }
    if (roll < 0.2 && !isFragment) {
      return { flags: 'text', text: this.text() };
    }
    if (roll < 0.35) {
      return { flags: 'single', child: this.node(null, allowShared, 'plain') };
    }
    if (roll < 0.5) {
      return {
        flags: 'nonKeyed',
        children: this.list(count, false, allowShared),
      };
    }
    if (roll < 0.65) {
      return { flags: 'keyed', children: this.list(count, true, allowShared) };
    }
    return { flags: 'unknown', children: this.raw(allowShared) };
  }

  private raw(allowShared: boolean): Raw {
    const roll = this.random();

    if (roll < 0.1) {
      return null;
    }
    if (roll < 0.2 && !this.options.hydratable) {
      return this.text();
    }
    if (roll < 0.5 || this.depth > 3) {
      return this.node(null, allowShared, 'plain');
    }
    const count = Math.floor(this.random() * 4);
    const keys = this.keys(count);
    const result: Raw[] = [];
    // Only flat arrays can have pool vNodes
    const flat = this.chance(0.5);

    this.depth++;
    for (let i = 0; i < count; ++i) {
      const itemRoll = this.random();

      if (itemRoll < 0.1 && !flat) {
        result.push(null);
      } else if (itemRoll < 0.2 && !flat) {
        result.push(this.raw(false));
      } else if (itemRoll < 0.3 && !this.options.hydratable) {
        result.push(this.text());
      } else {
        result.push(
          this.node(
            this.chance(0.5) ? keys[i] : null,
            allowShared && flat,
            'array',
          ),
        );
      }
    }
    this.depth--;
    return result;
  }
}

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
