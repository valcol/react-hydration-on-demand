/**
 * @jest-environment jsdom
 */

import React from "react";
import ReactDom from "react-dom";
import { render, fireEvent, wait } from "@testing-library/react";

import withHydrationOnDemand from "../../src";

const Component = ({ label }) => <div className="label">{label}</div>;
const serverSideText = "some content server side";
const clientSideText = "some content client side";

const SSRhtml = `<section data-hydration-on-demand="true"><div class="label">${serverSideText}</div></section>`;

describe("With SSR", () => {
    test("Render correctly client side, no option ", () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand()(
            Component
        );

        render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with delay", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["delay", 1000]]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with DOM event (onClick)", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        fireEvent.click(getByText(serverSideText));

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with DOM event (onClick), custom selector", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["click", () => elem]]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        fireEvent.click(elem);

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on idle", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        window.requestIdleCallback = jest.fn(f => f());

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["idle"]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(window.requestIdleCallback).toHaveBeenCalled();
        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on idle, requestIdleCallback unsupported", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        delete window.requestIdleCallback;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["idle"]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on visible, IntersectionObserver unsupported", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        delete window.IntersectionObserver;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["visible"]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on visible, component not visible", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const observe = jest.fn();
        const disconnect = jest.fn();
        const getOptions = jest.fn();
        window.IntersectionObserver = class IntersectionObserver {
            constructor(cb) {
                cb([{ isIntersecting: false, intersectionRatio: 0 }], this);
            }
            observe() {
                return observe();
            }
            disconnect() {
                return disconnect();
            }
        };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["visible", getOptions]]
        })(Component);

        render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        expect(observe).toHaveBeenCalled();
        expect(getOptions).toHaveBeenCalled();
        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on visible, component visible", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const observe = jest.fn();
        const disconnect = jest.fn();
        const getOptions = jest.fn();
        window.IntersectionObserver = class IntersectionObserver {
            constructor(cb) {
                cb([{ isIntersecting: true, intersectionRatio: 0.5 }], this);
            }
            observe() {
                return observe();
            }
            disconnect() {
                return disconnect();
            }
        };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["visible", getOptions]]
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        expect(observe).toHaveBeenCalled();
        expect(getOptions).toHaveBeenCalled();

        await wait(() => getByText(clientSideText));

        expect(disconnect).toHaveBeenCalled();
        expect(elem).toMatchSnapshot();
    });

    test("Client side, execute onBefore before hydration", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const onBefore = jest.fn();

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            onBefore
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        fireEvent.click(getByText(serverSideText));

        await wait(() => getByText(clientSideText));

        expect(onBefore).toHaveBeenCalled();
    });

    test("Render correctly client side, forceHydration ", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand()(
            Component
        );

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient
                forceHydration
                label={clientSideText}
            />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });
});

describe("Without SSR", () => {
    test("Render correctly client side", async () => {
        const elem = document.createElement("div");

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand()(
            Component
        );

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true
            }
        );

        await wait(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });
});
