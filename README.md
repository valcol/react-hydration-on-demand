<div align="center">
  <h1>
    <br/>
    <br/>
    💧
    <br />
    react-hydration-on-demand
    <br />
    <br />
    <br />
  </h1>
  <sup>
    <br />
    <br />
    <a href="https://www.npmjs.com/package/react-hydration-on-demand">
       <img src="https://img.shields.io/npm/dm/react-hydration-on-demand" alt="npm package" />
    </a>
    <a href="https://www.npmjs.com/package/react-hydration-on-demand">
       <img src="https://img.shields.io/github/actions/workflow/status/valcol/react-hydration-on-demand/main.yml" alt="npm package" />
    </a>
    <a href="https://www.npmjs.com/package/react-hydration-on-demand">
       <img src="https://img.shields.io/bundlephobia/minzip/react-hydration-on-demand" alt="dep size" />
    </a>
    <a href="https://www.npmjs.com/package/react-hydration-on-demand">
      <img src="https://img.shields.io/npm/v/react-hydration-on-demand" alt="version" />
    </a>
    <br />
  </sup>
   <h3>Hydrate your React components only when needed.<h3>
  <br />
  <br />
  <pre>npm i <a href="https://www.npmjs.com/package/react-hydration-on-demand">react-hydration-on-demand</a></pre>
  <pre>yarn add <a href="https://www.npmjs.com/package/react-hydration-on-demand">react-hydration-on-demand</a></pre>
  <br /> 
  <br />
</div>

[![Edit react-hydration-on-demand](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/stoic-sinoussi-64wys6)

Hydrates server-side rendered components only when necessary to offload the main thread, improving TTI, TBT, and FID.
It can be used with code-splitting libraries to load component code at runtime just before the hydration step, reducing the initial payload size of your application.

![](reactrender.png?raw=true)

## How to use

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import Card from "../Card";

//Hydrate when the component enters the viewport
const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["visible"] })(
    Card
);

//Hydrate when the browser's event loop is idle
const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["idle"] })(Card);

//Hydrate after a delay (by default: 2000ms)
const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["delay"] })(
    Card
);

//Hydrate after a custom delay (3000ms)
const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: [["delay", 3000]],
})(Card);

//Hydrate when the user scroll on the document
const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: [["scroll", () => document]],
})(Card);

//Hydrate when the when the browser's event loop is idle or when the user scroll, whichever comes first
const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: ["idle", "visible"],
})(Card);

//Load an async chunck before hydration
import loadable from "@loadable/component";

const LoadableCard = loadable(() => import("../Card"));
const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: [["scroll", () => document]],
    onBefore: LoadableCard.load,
})(LoadableCard);

//Never hydrate unless the prop forceHydration is set to true
const CardWithHydrationOnDemand = withHydrationOnDemand()(Card);

//...

export default class App extends React.Component {
    render() {
        return <CardWithHydrationOnDemand title="my card" />;
    }
}
```

> ### What if my component is also used client side only ?
>
> If the component isn't rendered server side, it will render directly and behave normally.

## How hydration works

### React 18+

The component is rendered inside a `<Suspense>` boundary, which stays dehydrated until one of the `on` events fires. The server markup is then **hydrated in place**: the DOM nodes are kept, so focus, scroll position, media and CSS animations are preserved.

- **The triggering event reaches your component.** When hydration is triggered by a DOM event on the component itself (e.g. `on: ["click"]`), React hydrates it synchronously and dispatches the event to it, so the first click works. This isn't possible when `onBefore` is set, as hydration has to wait for it.
- **Props updates before hydration are safe.** Until hydration, the component keeps the props it was first rendered with (the ones matching the server markup). It is hydrated with them, then immediately re-rendered with the latest props.
- **Context updates before hydration** (a context consumed inside the component changing before it's hydrated) make React discard the server markup and render the component from scratch, unless the update is wrapped in `startTransition`.

### React 16 / 17

The server markup is kept untouched until hydration, then the component is **rendered from scratch** client side: the DOM nodes are re-created, and the event triggering the hydration isn't received by the component.

## Options

### `on: Array`

An array of events who will trigger the hydration.
Can contains event names directly or as an array of `['event name', options]`.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import Card from "../Card";

const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: ["visible", ["scroll", () => document], ["delay", 5000]],
})(Card);
```

Support [all DOM events](https://developer.mozilla.org/en-US/docs/Web/Events) and more :

| Event name                                                                | Options                                                                                                                                                                 | Description                                                                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [**all DOM events**](https://developer.mozilla.org/en-US/docs/Web/Events) | `getTarget: Function` who return the event target (default: the wrapped component)                                                                                      |
| **delay**                                                                 | `delay: Number` in ms (default value: 2000)                                                                                                                             | Scheduled hydration.                                                                                                           |
| **visible**                                                               | `getOptions: Function` who return an [intersectionObserver options](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) object (default: no options) | Requires IntersectionObserver. **Polyfill not included.** If unsupported the component is directy hydrated.                    |
| **idle**                                                                  |                                                                                                                                                                         | Requires requestIdleCallback. **Polyfill not included.** If unsupported the component will be hydrated with a delay of 2000ms. |

### `onBefore: Promise` (optional)

Promise to resolve before hydration.

> Can be usefull if you need to preload chunks before hydration for example.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import loadable from "@loadable/component";

const LoadableCard = loadable(() => import("../Card"));
const CardWithHydrationOnDemand = withHydrationOnDemand({
    on: ["visible"],
    onBefore: LoadableCard.load,
})(LoadableCard);
```

### `disableFallback: Boolean` (optional, default: false)

If set at true the component will not be rendered client side if not rendered server side.

## Props

### `wrapperProps: Object` (optional)

Props that are applied to the div which wraps the provided component.

#### `wrapperProps.as: String | React.ComponentType` (optional, default: 'section')

Specifies the HTML element or React component to use as the wrapper. This allows for semantically correct and accessible markup. For example, use `'div'` for generic containers or `'a'` for links.

A React component used as the wrapper must forward its `ref` and pass all the props it receives to the DOM element it renders.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import Card from "../Card";

const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["delay"] })(Card);

export default class App extends React.Component {
    render() {
        return (
            <CardWithHydrationOnDemand
                title="my card"
                wrapperProps={{
                    as: 'div', // Use a div instead of the default section
                    className: "customClassName",
                    style: { display: "contents" },
                }}
            />
        );
    }
}
```

### `forceHydration: Boolean` (optional, default: false)

Force the hydration of the component.

## Playground & Bug Reproduction

You can use the following CodeSandbox to try out the library or reproduce bugs. When creating a new issue, please fork this sandbox and include the link in your bug report to help me understand and fix the problem more efficiently.

[![Edit react-hydration-on-demand](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/stoic-sinoussi-64wys6)
