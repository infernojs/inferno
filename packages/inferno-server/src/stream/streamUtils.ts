
export function mergePendingState(componentInstance) {
  const pendingState = componentInstance.$PS;

  if (pendingState) {
    const state = componentInstance.state;

    if (state === null) {
      componentInstance.state = pendingState;
    } else {
      for (const key in pendingState) {
        state[key] = pendingState[key];
      }
    }
    componentInstance.$PS = null;
  }

  componentInstance.$BR = false;
}
