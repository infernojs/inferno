# InfernoJS

Inferno is a framework for building user-interface components (specifically for the browser's DOM). Inferno strives to delivery the best performance for not only initial
page render times, but for sequential and random update render times too. Like React and Mitrhil, Inferno adopts elements of a virtual DOM as a lightweight representation of the
actual DOM. However, unlike other frameworks that use virtual DOMs, Inferno does not carry out expensive diffs on the virtual DOM, but on the values within the virtual DOM.

## In development

Inferno is still in early development and there are still many missing features and optimisations to be had. Do not use this framework in production environments until a stable
release has been stated. Features that still need to be completed:

- Cloning nodes needs refining and completing
- More input events need to be added as does the case of the root input delegation source
- Performance can be slower than desired when dealing with many template keys, refactor needed of template keys returned as values
- There are currently no tests in place, this needs to be done
- There is no API documentation or general documentation available

## Key Features

- Inferno is currently one of the fastest front-end framework there is for rendering UI components.
- Inferno components have a very similar API to React ES6 components – with a few slight adjustments to how contexts are passed around.
- Inferno requires the [t7 template](https://github.com/trueadm/t7) library to parse its templates into optimised Inferno virtual DOM objects.
- Inferno is light-weight and compact – it doesn't have routers, controllers or Flux built-in. It doesn't have any hard dependencies other than `t7` (which comes bundled with Inferno).
- Inferno is isomorphic and can easily be compiled and run on the server (via Node).

## Performance

Inferno tries to address two problems with creating UI components:
- Writing large applications in large teams is slow in terms of development and expensive in costs – it shouldn't be.
- Writing complex applications generally gives poor performance on mobile/tablet/older machines – it shouldn't.
- Writing intensive modern UIs that require many updates/animations falls apart and becomings overly complicated - it shouldn't be.

Writing code should be fun. Browsers are getting more advanced and the technologies being supported are growing by the week. It's about
time a framework offered more fun without compromising performance.

## Benchmarks

Links to come!
