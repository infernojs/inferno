---
title: Comparison to React
---

Inferno intentionally aims to have the same developer look and feel as [React](//facebook.github.io/react) – meaning that Inferno supports the majority of React's API and also utilises a "virtual DOM" behind the scenes. This decision was made due to the stability and high adoption of React in a relatively short period of time. The React API is well-recieved, documented, understood and battle-tested. Inferno could have created its own API, but that would have pushed people into having to learn yet another way of doing things. 

There are thousands of addons, plugins, extensions, tools and applications that work on-top of the standard React API. By having a similar API, switching from React to Inferno should be possible without having to refactor and rewrite an entire codebase. Using the `inferno-compat` compatability package, a developer can painlessly switch from React to Inferno with a few changes to their Webpack/Browserify config. In the future, we'll add tools/codemods to automatically convert React projects to Inferno projects.

Do you use Redux, MobX, React Router, React Motion or many of the countless other libraries out there? Good chance is that we've already got a dedicated Inferno package or one in conversion. We've found that upon converting various third-party libraries, from React to Inferno, they tend to be: smaller in size, more performant and still function in  the exact same way as they did in React. That's a good *free* win!

### Differences to React

So if Inferno is like React, why even bother with Inferno? There are some key differences:

- Inferno has been broken up into several lightweight packages that allow developers to pick and choose what they want to use. Do you dislike ES2015 classes for components? Then you shouldn't include the `inferno-component` package and stick with stateless functional components. Do you prefer `hyperscript` over `createElement`? Use `inferno-hyperscript` instead of `inferno-create-element`. If you created a basic React-like setup with Inferno, you'd probably take `inferno`, `inferno-dom` and `inferno-component`. Combined into one bundle, they weigh in around 8kb gzip – that's pretty good. Compared to React, which is 45kb gzip.

- Inferno aims to have much of the same great developer experience features available but without having as many of the limitations that React has. Inferno doesn't tell you to use keys on arrays where you, as the developer, feel that having keys will give you no real benefit. Inferno allows you to render arrays from component renders, so you can totally do this: `const MyComponent => [<div />, </div />]`. Furthermore, the same great debugging/developer tooling experience that React offers is also coming to Inferno. Inferno Chrome dev tools is well under development and a lot of work has gone into providing the same level of console warnings/errors for when something goes wrong.

- Inferno provides an API for rendering server side content to streams. This massively improves performance, much improving the time-to-first-byte for the user. Caches have also been added so users aren't left with a subpar experience when rendering complex apps on the backend.

- Inferno attempts to recycle DOM nodes where possibly. This can really improve performance, especially on mobile, when routing between pages or rendering large lists/tables of data. Rather than trash old DOM nodes and then re-create new ones everytime, Inferno takes the old DOM node and updates it to the reflect the state of the UI.

- Inferno provides component lifecycle hooks for stateless functional components out-of-the-box. This is great for when you want to add a `shouldComponentUpdate` to optimise a component.

- Inferno makes some huge optimisations to JSX compilation. Inferno can figure out what parts of your UI structure are dynamic and static. Rather than hoisting out static content, Inferno takes this further by having a completely different virtual DOM render path for such cases. This can make some impressive performance benefits in applications that contain a large amount of static content.

- Inferno doesn't have a synthetic events system, instead adopting to use the native browser event system as many other libraries/frameworks do. There are pros and cons for both approaches (compatability vs performance/size). However, there are discussions of adding a synthetic events system into Inferno as a plugin/package rather than having it in the core `inferno-dom` package. This will allow the developer to decide what is best for their app.

### React is fast enough?

A common criticism is that React is fast enough and that Inferno doesn't really give any real-world benefits. Whilst this is completely true for desktop apps, it's a completely different ball game with mobile. Trying to get a React app run smoothly on old Android mobile device can be painful (I know from first-hand experience). Mobile introduces lots of problems: lack of memory, lack of processing power, lack of JIT compilation and battery-usage constraints. I've spent a huge amount of time addressing these concerns, so you could call Inferno a mobile-first JavaScript UI library. It's not also a write-off for desktop users too. 

We've also had overwhlming feedback from developers who create applications that require smooth animation or fast updating UIs have seen large real-world benefits with Inferno. Personally, my approach is always the same: if you feel that you are experiencing problems with performance – give Inferno a try and see what results you get.

### Can't React get faster?

It definitely can get faster and the Inferno team will help as much as possible. Personally, I've taken an acive approach to try and port these improvements and ideas back into React core where possible. The open-source community strives best when there is competition from others. We can all learn a lot from one another – our tools/libraries/frameworks will only get better for everyone if the teams behind them are willing to embrace new ideas and work together.
