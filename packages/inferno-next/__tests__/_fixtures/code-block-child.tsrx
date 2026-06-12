// `@{ … }` at JSX child position — supported when the block is
// render-only (no setup statements). Empty `@{}` is silently dropped.
// Setup-bearing blocks throw at compile time with a workaround hint
// pointing at the render-prop arrow form.

export function RenderOnlyChild() @{
  <div class='outer'>
    <span class='lead'>{'lead'}</span>
    @{ <span class='block'>{'block-body'}</span> }
    <span class='tail'>{'tail'}</span>
  </div>
}

// Two `@{ }` siblings — each renders its own JSX root. Order is preserved
// (relies on the source-order anchor work landed earlier in tsrx-migration).
export function MultipleBlocks() @{
  <ul>
    @{ <li class='a'>{'one'}</li> }
    @{ <li class='b'>{'two'}</li> }
    @{ <li class='c'>{'three'}</li> }
  </ul>
}

// Empty `@{}` at child position is silently dropped — exercised here by
// placing one between two static siblings and asserting they sit adjacent.
export function EmptyBlockDropped() @{
  <div>
    <span class='before'>{'before'}</span>
    @{}
    <span class='after'>{'after'}</span>
  </div>
}
