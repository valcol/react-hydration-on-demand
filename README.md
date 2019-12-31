# react-hydration-on-demand

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/valcol/react-hydration-on-demand/NPM%20Publish)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-hydration-on-demand)
![npm](https://img.shields.io/npm/v/react-hydration-on-demand)

Hydrate your React components only when you need to

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

const CardWithHydrationOnDemand = withHydrationOnDemand({ on: ["visible"] })(
  Card
);

export default class App extends React.Component {
  render() {
    return <CardWithHydrationOnDemand title="my card" />;
  }
}
```

### What if my component is also used client side only ?

If the component isn't rendered server side, it will render directly and behave normally.

## Options

#### `on: Array`

An array of events who will trigger the hydration.
Can contains event names directly or array of 2 elements: `['event name', options]`.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import Card from "../Card";

const CardWithHydrationOnDemand = withHydrationOnDemand({
  on: ["visible", ["scroll", document], ["delay", 5000]]
})(Card);
```

Support [all DOM events](https://developer.mozilla.org/en-US/docs/Web/Events) and more :

| Event name                                                                | Options                                                                                                   | Description                                                                                                               |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [**all DOM events**](https://developer.mozilla.org/en-US/docs/Web/Events) | target (default value: the provided component)                                                            |
| **delay**                                                                 | delay in ms (default value: 2000)                                                                         | Scheduled hydration.                                                                                                      |
| **visible**                                                               | [See intersectionObserver options](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) | Requires IntersectionObserver. **Polyfill not included.** If unsupported the component is directy hydrated.               |
| **idle**                                                                  |                                                                                                           | Requires requestIdleCallback. **Polyfill not included.** If unsupported the component is hydrated with a delay of 2000ms. |

#### `onBefore: Promise` (optional)

Promise to resolve before hydration. Can be usefull if you need to preload chunks before hydration for example.

```js
import withHydrationOnDemand from "react-hydration-on-demand";
import loadable from "@loadable/component";

const LoadableCard = loadable(() => import("../Card"));
const CardWithHydrationOnDemand = withHydrationOnDemand({
  on: ["visible"],
  onBefore: LoadableCard.load
})(Card);
```

## Props

#### `wrapperProps: Object` (optional)

Props that are applied to the div which wraps the provided component.

#### `forceHydration: Object` (optional)

Force the hydration of the component.
