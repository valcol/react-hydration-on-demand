/**
 * @jest-environment jsdom
 */

import React from "react";
import ReactDom from "react-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";

import withHydrationOnDemand from "../../src";

const Component = ({ label }) => <div className="label">{label}</div>;
const serverSideText = "some content server side";
const clientSideText = "some content client side";

const SSRhtml = `<section data-hydration-on-demand="true"><div class="label">${serverSideText}</div></section>`;

const originalRequestIdleCallback = window.requestIdleCallback;
const originalCancelIdleCallback = window.cancelIdleCallback;
const originalIntersectionObserver = window.IntersectionObserver;
const originalClearTimeout = window.clearTimeout;

beforeEach(() => {
    window.requestIdleCallback = originalRequestIdleCallback;
    window.cancelIdleCallback = originalCancelIdleCallback;
    window.IntersectionObserver = originalIntersectionObserver;
    window.clearTimeout = originalClearTimeout;
    window.navigator.scheduling = undefined;
});

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
                hydrate: true,
            }
        );

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with delay", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["delay", 200]],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });



    test("Render correctly client side, with whenInputPending at true and no input pending", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;
        window.navigator.scheduling = { isInputPending : jest.fn(() => false) };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            whenInputPending: true,
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        expect(window.navigator.scheduling.isInputPending).toHaveBeenCalled();

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with whenInputPending at true and input pending", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;
        window.navigator.scheduling = { isInputPending : jest.fn(() => true) };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            whenInputPending: true,
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        expect(window.navigator.scheduling.isInputPending).toHaveBeenCalled();

        fireEvent.click(getByText(serverSideText));

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with whenInputPending at true and isInputPending unsupported", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;
        window.navigator.scheduling = {};

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            whenInputPending: true,
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        fireEvent.click(getByText(serverSideText));

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with whenInputPending at true, isInputPending unsupported and isInputPendingFallbackValue at false", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;
        window.navigator.scheduling = {};

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            whenInputPending: true,
            isInputPendingFallbackValue: false,
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with DOM event (onClick)", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        fireEvent.click(getByText(serverSideText));

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, with DOM event (onClick), custom selector", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["click", () => elem]],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        elem.removeEventListener = jest.fn();
        fireEvent.click(elem);

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
        expect(elem.removeEventListener).toHaveBeenCalled();
    });

    test("Render correctly client side, on idle", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        window.requestIdleCallback = jest.fn((f) => f());
        window.cancelIdleCallback = jest.fn();
        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["idle"],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

        expect(window.requestIdleCallback).toHaveBeenCalled();
        expect(elem).toMatchSnapshot();
        expect(window.cancelIdleCallback).toHaveBeenCalled();
    });

    test("Render correctly client side, on idle, requestIdleCallback unsupported", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        delete window.requestIdleCallback;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["idle"],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText), { timeout: 3000 });

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side, on visible, IntersectionObserver unsupported", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        delete window.IntersectionObserver;

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["visible"],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

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
                this.cb = cb;
            }
            observe() {
                this.cb(
                    [{ isIntersecting: false, intersectionRatio: 0 }],
                    this
                );
                return observe();
            }
            disconnect() {
                return disconnect();
            }
        };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["visible", getOptions]],
        })(Component);

        render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
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
                this.cb = cb;
            }
            observe() {
                this.cb(
                    [{ isIntersecting: true, intersectionRatio: 0.5 }],
                    this
                );
                return observe();
            }
            disconnect() {
                return disconnect();
            }
        };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: [["visible", getOptions]],
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        expect(observe).toHaveBeenCalled();
        expect(getOptions).toHaveBeenCalled();
        await waitFor(() => getByText(clientSideText));
        expect(elem).toMatchSnapshot();
        expect(disconnect).toHaveBeenCalled();
    });

    test("Client side, execute onBefore before hydration", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        const onBefore = jest.fn();

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["click"],
            onBefore,
        })(Component);

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        fireEvent.click(getByText(serverSideText));

        await waitFor(() => getByText(clientSideText));

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
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });

    test("Clean functions called on component unmount", async () => {
        const elem = document.createElement("div");
        elem.innerHTML = SSRhtml;

        elem.removeEventListener = jest.fn();
        window.requestIdleCallback = jest.fn(Function.prototype);
        window.cancelIdleCallback = jest.fn();
        window.clearTimeout = jest.fn();
        const disconnect = jest.fn();
        window.IntersectionObserver = class IntersectionObserver {
            constructor() {}
            observe() {}
            disconnect() {
                return disconnect();
            }
        };

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            on: ["idle", "delay", "visible", ["click", () => elem]],
        })(Component);

        const { unmount } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        unmount();
        expect(window.cancelIdleCallback).toHaveBeenCalled();
        expect(window.clearTimeout).toHaveBeenCalled();
        expect(elem.removeEventListener).toHaveBeenCalled();
        expect(disconnect).toHaveBeenCalled();
    });
});

describe("Without SSR", () => {
    test("Don't render client side only with fallback disabled", async () => {
        const elem = document.createElement("div");

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand({
            disableFallback: true,
        })(Component);

        render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        expect(elem).toMatchSnapshot();
    });

    test("Render correctly client side only", async () => {
        const elem = document.createElement("div");

        const ComponentWithHydrationOnDemandClient = withHydrationOnDemand()(
            Component
        );

        const { getByText } = render(
            <ComponentWithHydrationOnDemandClient label={clientSideText} />,
            {
                container: elem,
                hydrate: true,
            }
        );

        await waitFor(() => getByText(clientSideText));

        expect(elem).toMatchSnapshot();
    });
});
