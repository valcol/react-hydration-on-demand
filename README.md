# react-hydration-on-demand - Progressive hydration made easy 💧

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/valcol/react-hydration-on-demand/NPM%20Publish)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-hydration-on-demand)
![npm](https://img.shields.io/npm/v/react-hydration-on-demand)
![npm](https://img.shields.io/npm/dm/react-hydration-on-demand)

Hydrate your component rendered server-side only when needed to relieve the main thread, thus improving TTI, TBT and FID.
Can be used with a code-splitting library to load the component code at runtime right before the hydration step and reduce the initial payload size of your application.

![](reactrender.png?raw=true)

## Install

#### npm

```
npm install react-hydration-on-demand --save
```

#### yarn

```
yarn add react-hydration-on-demand
```

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

//Never hydrate unless forceHydrate is set to true in the props
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

### `whenInputPending: Boolean` (optional, default: false)

When set to true use `navigator.scheduling.isInputPending` to check if there is a pending user input on mount. If that's the case, hydration will be delayed using the strategies defined in the `on` option to allow the browser to handle the user input.
If there is no pending input, the component will be hydrated directly to be interactive as fast as possible.

See https://github.com/WICG/is-input-pending for more infos.

### `isInputPendingFallbackValue: Boolean` (optional, default: true)

The default value returned on browsers who don't implements `navigator.scheduling.isInputPending` when `whenInputPending` set to true.

### `disableFallback: Boolean` (optional, default: false)

If set at true the component will not be rendered client side if not rendered server side.

## Props

### `wrapperProps: Object` (optional)

Props that are applied to the div which wraps the provided component.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import Card from "../Card";

const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["delay"] })(
    Card
);

export default class App extends React.Component {
    render() {
        return (
            <CardWithHydrationOnDemand
                title="my card"
                wrapperProps={{
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
