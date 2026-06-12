import { describe, it, expect } from 'vitest';
import { mount } from './_helpers';
import { compile } from '../compiler/compile.js';
import { RenderOnlyChild, MultipleBlocks, EmptyBlockDropped } from './_fixtures/code-block-child.tsrx';

describe('@{ } at JSX child position', () => {
  it('render-only @{} renders its JSX root as a sibling', () => {
    const r = mount(RenderOnlyChild);
    const spans = Array.from(r.find('.outer').children) as HTMLElement[];
    expect(spans.map(s => s.className)).toEqual(['lead', 'block', 'tail']);
    expect(r.find('.block').textContent).toBe('block-body');
    r.unmount();
  });

  it('multiple @{} siblings each render their root in source order', () => {
    const r = mount(MultipleBlocks);
    const items = Array.from(r.findAll('li')) as HTMLElement[];
    expect(items.map(i => i.className)).toEqual(['a', 'b', 'c']);
    expect(items.map(i => i.textContent)).toEqual(['one', 'two', 'three']);
    r.unmount();
  });

  it('empty @{} is silently dropped (siblings sit adjacent)', () => {
    const r = mount(EmptyBlockDropped);
    const kids = Array.from(r.find('div').children) as HTMLElement[];
    expect(kids.map(k => k.className)).toEqual(['before', 'after']);
    r.unmount();
  });

  it('compiler rejects setup-bearing @{} at child position with workaround hint', () => {
    const src =
      "export function A() @{ <div>@{ const x = 1; <span>{x as string}</span> }</div> }";
    expect(() => compile(src, 'setup-block.tsrx')).toThrow(
      /`@\{ … \}` with setup statements is not supported at JSX child position[\s\S]*\{\(\) =>/
    );
  });
});
