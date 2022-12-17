export function createEventGuard() {
  const eventState = { done: false };
  const markEventCompleted = () => {
    eventState.done = true;
  }
  const waitForEventToTriggerRender = async () => {
    // Wait until event is marked as completed
    while (!eventState.done) {
      await new Promise((resolved) => setTimeout(resolved, 1));
    }
    // Allow render loop to run
    await new Promise((resolved) => setTimeout(resolved, 0));
  }

  return [
    markEventCompleted,
    waitForEventToTriggerRender
  ]
}
