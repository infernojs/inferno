export function mergePendingState(componentInstance): void {
  const pendingState = componentInstance.$PS;

  if (pendingState) {
    const state = componentInstance.state;

    if (state === null) {
      componentInstance.state = pendingState;
    } else {
      componentInstance.state = { ...state, ...pendingState };
    }
    componentInstance.$PS = null;
  }

  componentInstance.$BR = false;
}
