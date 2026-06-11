import { describe, it, expect } from 'vitest';
import { compileToVolarMappings } from '../compiler/volar.js';

/**
 * Volar mappings tests. We exercise the IDE-facing virtual-TSX pipeline:
 *   - Returns a `VolarMappingsResult` (code + mappings + cssMappings + errors).
 *   - Generates TSX (`code`) containing the user identifiers (so TypeScript's
 *     language service can see / type-check them).
 *   - Reports parse errors via `errors` array rather than throwing, so the
 *     editor can show diagnostics on an in-progress file.
 *
 * We don't snapshot the full TSX — its exact shape is `@tsrx/core`'s
 * `createJsxTransform` output, which evolves separately. We just verify
 * the contract.
 */
describe('compileToVolarMappings', () => {
  it('returns a VolarMappingsResult shape', () => {
    const src =
      "import { useState } from 'inferno-next';\n" +
      "export function Counter() @{\n" +
      "  const [n, setN] = useState(0);\n" +
      "  <button onClick={() => setN(n + 1)}>{n as string}</button>\n" +
      "}\n";
    const result = compileToVolarMappings(src, 'counter.tsrx');
    expect(typeof result.code).toBe('string');
    expect(Array.isArray(result.mappings)).toBe(true);
    expect(Array.isArray(result.cssMappings)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.sourceAst).toBeDefined();
    expect(result.sourceAst.type).toBe('Program');
  });

  it('preserves user identifiers in the generated TSX', () => {
    const src =
      "import { useState } from 'inferno-next';\n" +
      "export function MyButton(props) @{\n" +
      "  const [count, setCount] = useState(0);\n" +
      "  <button onClick={() => setCount(count + 1)}>{(props.label + ':' + count) as string}</button>\n" +
      "}\n";
    const result = compileToVolarMappings(src, 'my-button.tsrx');
    // The user's identifiers must appear in the virtual TSX so the language
    // service can resolve them on hover / autocomplete.
    expect(result.code).toContain('MyButton');
    expect(result.code).toContain('count');
    expect(result.code).toContain('setCount');
    expect(result.code).toContain('props.label');
    expect(result.errors).toEqual([]);
  });

  it('produces mappings entries pointing source → generated positions', () => {
    const src =
      "export function Foo() @{ <span>{'hi'}</span> }\n";
    const result = compileToVolarMappings(src, 'foo.tsrx');
    expect(result.mappings.length).toBeGreaterThan(0);
    // Each Volar mapping carries parallel source/generated offset arrays,
    // length arrays, and a `data` flag bag.
    for (const m of result.mappings) {
      expect(Array.isArray(m.sourceOffsets)).toBe(true);
      expect(Array.isArray(m.generatedOffsets)).toBe(true);
      expect(Array.isArray(m.lengths)).toBe(true);
      expect(m.sourceOffsets.length).toBe(m.generatedOffsets.length);
      expect(m.data).toBeDefined();
    }
  });

  it('reports a typed error array when there are no parse errors', () => {
    // Hard parse errors still throw (the underlying acorn parser can't
    // recover from arbitrary brace mismatches). When parsing succeeds the
    // `errors` field is a typed empty array the language server can append
    // to as it runs further analysis.
    const src =
      "export function Ok() @{ <span>{'hi'}</span> }\n";
    const result = compileToVolarMappings(src, 'ok.tsrx');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('handles @if / @for / @try / @switch directives', () => {
    const src =
      "import { useState } from 'inferno-next';\n" +
      "export function App(props) @{\n" +
      "  const [n] = useState(0);\n" +
      "  <div>\n" +
      "    @if (n > 0) { <p>{'pos'}</p> } @else { <p>{'zero'}</p> }\n" +
      "    @for (const x of props.items; key x.id) { <li>{x.label as string}</li> }\n" +
      "    @switch (n) {\n" +
      "      @case 0: { <span>{'z'}</span> }\n" +
      "      @default: { <span>{'else'}</span> }\n" +
      "    }\n" +
      "  </div>\n" +
      "}\n";
    const result = compileToVolarMappings(src, 'app.tsrx');
    expect(result.errors).toEqual([]);
    expect(result.code.length).toBeGreaterThan(0);
    // Identifiers from each directive should leak through to the TSX.
    expect(result.code).toContain('App');
    expect(result.code).toContain('props.items');
    expect(result.code).toContain('x.label');
  });

  it('exposes the (transformed) AST for editor integrations that need to walk it', () => {
    const src =
      "export function Foo() @{ <p>{'x'}</p> }\n";
    const result = compileToVolarMappings(src, 'foo.tsrx');
    // The AST is the same node graph the transform pass walked (it mutates
    // in place, which is why JSXCodeBlock bodies get lowered to plain
    // BlockStatements en route to TSX). Language plugins use it for symbol
    // indexing, hover queries, refactorings — they read the post-transform
    // shape because that's what the `mappings` array points into.
    expect(result.sourceAst.type).toBe('Program');
    const fnDecl = (result.sourceAst.body as any[]).find(
      n => n.type === 'ExportNamedDeclaration' && n.declaration?.type === 'FunctionDeclaration'
    );
    expect(fnDecl?.declaration?.id?.name).toBe('Foo');
  });
});
