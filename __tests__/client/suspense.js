/**
 * @jest-environment jsdom
 */

import React, { useState } from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react";

import withHydrationOnDemand from "../../src";

const Component = ({ label, onClick }) => (
  <div className="label" onClick={onClick}>
    {label}
  </div>
);
const Counter = ({ label }) => {
  const [count, setCount] = useState(0);
  return (
    <button className="label" onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  );
};

const serverText = "some content";

// Render with the server build of the library, as a real SSR setup would.
const renderToServerHTML = (options, element) => {
  let html;
  jest.isolateModules(() => {
    jest.doMock("exenv", () => ({ canUseDOM: false }));
    // Share the React instance used by the components defined in this file.
    jest.doMock("react", () => React);
    const ReactDOMServer = require("react-dom/server.node");
    const withHydrationOnDemandServer = require("../../src").default;
    const ServerComponent = withHydrationOnDemandServer(options)(
      element.type
    );
    html = ReactDOMServer.renderToString(
      <ServerComponent {...element.props} />
    );
  });
  return html;
};

const containers = [];
const createContainer = (html = "") => {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  containers.push(container);
  return container;
};

const hydrate = (container, element) => {
  const onRecoverableError = jest.fn();
  const result = render(element, {
    container,
    hydrate: true,
    onRecoverableError,
  });
  return { ...result, onRecoverableError };
};

const originalRequestIdleCallback = window.requestIdleCallback;
const originalCancelIdleCallback = window.cancelIdleCallback;
const originalIntersectionObserver = window.IntersectionObserver;

let consoleError;
beforeEach(() => {
  consoleError = jest.spyOn(console, "error");
});

afterEach(() => {
  consoleError.mockRestore();
  window.requestIdleCallback = originalRequestIdleCallback;
  window.cancelIdleCallback = originalCancelIdleCallback;
  window.IntersectionObserver = originalIntersectionObserver;
  containers.splice(0).forEach((container) => container.remove());
});

describe("Server side", () => {
  test("Wraps the component in a Suspense boundary", () => {
    const html = renderToServerHTML(
      {},
      <Component label={serverText} forceHydration />
    );

    expect(html).toMatchSnapshot();
    expect(html).not.toContain("forceHydration");
  });
});

describe("With SSR", () => {
  test("Keeps the server markup untouched until hydration", async () => {
    const options = { on: ["click"] };
    const container = createContainer(
      renderToServerHTML(options, <Component label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Component);

    const { onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );

    expect(container.querySelector(".label")).toBe(serverNode);
    expect(container).toMatchSnapshot();
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Hydrates the server markup in place", async () => {
    const options = { on: [["delay", 50]] };
    const container = createContainer(
      renderToServerHTML(options, <Counter label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Counter);

    const { onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));

    fireEvent.click(serverNode);

    expect(container.querySelector(".label")).toBe(serverNode);
    expect(serverNode.textContent).toBe(`${serverText}: 1`);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("The event triggering the hydration reaches the component", async () => {
    const options = { on: ["click"] };
    const container = createContainer(
      renderToServerHTML(options, <Counter label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Counter);

    const { onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );

    fireEvent.click(serverNode);

    await waitFor(() =>
      expect(serverNode.textContent).toBe(`${serverText}: 1`)
    );
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Props changing before hydration don't discard the server markup", async () => {
    const options = { on: ["click"] };
    const container = createContainer(
      renderToServerHTML(options, <Component label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Component);

    const { rerender, onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );

    rerender(<Hydrated label="updated content" />);
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(serverNode.textContent).toBe(serverText);

    fireEvent.click(serverNode);

    await waitFor(() => expect(serverNode.textContent).toBe("updated content"));
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Hydrates with a DOM event on a custom target", async () => {
    const options = { on: [["scroll", () => document]] };
    const container = createContainer(
      renderToServerHTML(options, <Counter label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Counter);

    hydrate(container, <Hydrated label={serverText} />);
    fireEvent.scroll(document);
    await act(() => Promise.resolve());

    fireEvent.click(serverNode);
    expect(serverNode.textContent).toBe(`${serverText}: 1`);
  });

  test("Hydrates on idle", async () => {
    window.requestIdleCallback = jest.fn((callback) => callback());
    window.cancelIdleCallback = jest.fn();
    const options = { on: ["idle"] };
    const container = createContainer(
      renderToServerHTML(options, <Counter label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Counter);

    hydrate(container, <Hydrated label={serverText} />);

    await waitFor(() => {
      fireEvent.click(serverNode);
      expect(serverNode.textContent).not.toBe(`${serverText}: 0`);
    });
    expect(window.requestIdleCallback).toHaveBeenCalled();
    expect(window.cancelIdleCallback).toHaveBeenCalled();
  });

  test("Hydrates when visible", async () => {
    const disconnect = jest.fn();
    const getOptions = jest.fn(() => ({ rootMargin: "10px" }));
    let observerOptions;
    window.IntersectionObserver = class IntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        observerOptions = options;
      }
      observe() {
        this.callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
      }
      disconnect() {
        disconnect();
      }
    };
    const options = { on: [["visible", getOptions]] };
    const container = createContainer(
      renderToServerHTML(options, <Component label={serverText} />)
    );
    const Hydrated = withHydrationOnDemand(options)(Component);

    const serverNode = container.querySelector(".label");

    const { rerender } = hydrate(container, <Hydrated label={serverText} />);
    rerender(<Hydrated label="client content" />);

    await waitFor(() => expect(serverNode.textContent).toBe("client content"));
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(observerOptions).toEqual({ rootMargin: "10px" });
    expect(disconnect).toHaveBeenCalled();
  });

  test("Waits for onBefore before hydrating, and calls it once", async () => {
    let resolveOnBefore;
    const onBefore = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveOnBefore = resolve;
        })
    );
    const options = { on: ["click", ["delay", 10]], onBefore };
    const container = createContainer(
      renderToServerHTML(options, <Component label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand(options)(Component);

    const { rerender, onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );
    rerender(<Hydrated label="client content" />);
    fireEvent.click(serverNode);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(serverNode.textContent).toBe(serverText);

    await act(async () => resolveOnBefore());

    await waitFor(() => expect(serverNode.textContent).toBe("client content"));
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(onBefore).toHaveBeenCalledTimes(1);
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  test("Hydrates when forceHydration is set", async () => {
    const container = createContainer(
      renderToServerHTML({}, <Component label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand()(Component);

    const { rerender, onRecoverableError } = hydrate(
      container,
      <Hydrated label={serverText} />
    );
    rerender(<Hydrated label="client content" forceHydration />);

    await waitFor(() => expect(serverNode.textContent).toBe("client content"));
    expect(container.querySelector(".label")).toBe(serverNode);
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  test("Hydrates immediately when forceHydration is set initially", () => {
    const container = createContainer(
      renderToServerHTML({}, <Counter label={serverText} />)
    );
    const serverNode = container.querySelector(".label");
    const Hydrated = withHydrationOnDemand()(Counter);

    hydrate(container, <Hydrated label={serverText} forceHydration />);
    fireEvent.click(serverNode);

    expect(serverNode.textContent).toBe(`${serverText}: 1`);
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Supports a custom wrapper element", async () => {
    const options = { on: ["click"] };
    const wrapperProps = { as: "div", className: "wrapper" };
    const container = createContainer(
      renderToServerHTML(
        options,
        <Component label={serverText} wrapperProps={wrapperProps} />
      )
    );
    const Hydrated = withHydrationOnDemand(options)(Component);

    hydrate(
      container,
      <Hydrated label={serverText} wrapperProps={wrapperProps} />
    );

    expect(container.querySelector("div.wrapper .label")).toBeTruthy();
    expect(container).toMatchSnapshot();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Cleans up on unmount", () => {
    window.requestIdleCallback = jest.fn(() => 1);
    window.cancelIdleCallback = jest.fn();
    const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");
    const removeEventListener = jest.spyOn(document, "removeEventListener");
    const disconnect = jest.fn();
    window.IntersectionObserver = class IntersectionObserver {
      observe() {}
      disconnect() {
        disconnect();
      }
    };
    const options = { on: ["idle", "delay", "visible", "click"] };
    const container = createContainer(
      renderToServerHTML(options, <Component label={serverText} />)
    );
    const Hydrated = withHydrationOnDemand(options)(Component);

    const { unmount } = hydrate(container, <Hydrated label={serverText} />);
    unmount();

    expect(window.cancelIdleCallback).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      true
    );
    expect(disconnect).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
    removeEventListener.mockRestore();
  });
});

describe("Without SSR", () => {
  test("Renders immediately", async () => {
    const container = createContainer();
    const Hydrated = withHydrationOnDemand({ on: ["click"] })(Component);

    await act(async () => {
      render(<Hydrated label="client content" />, { container });
    });

    expect(container.querySelector(".label").textContent).toBe(
      "client content"
    );
    expect(container).toMatchSnapshot();
  });

  test("Calls onBefore once and ignores the triggers", async () => {
    const onBefore = jest.fn(() => Promise.resolve());
    const Hydrated = withHydrationOnDemand({
      on: [["delay", 10]],
      onBefore,
    })(Component);
    const container = createContainer();

    await act(async () => {
      render(<Hydrated label="client content" />, { container });
    });

    expect(container.querySelector(".label").textContent).toBe(
      "client content"
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  test("Doesn't render with fallback disabled", () => {
    const container = createContainer();
    const Hydrated = withHydrationOnDemand({ disableFallback: true })(
      Component
    );

    render(<Hydrated label="client content" />, { container });

    expect(container.querySelector(".label")).toBeNull();
    expect(container).toMatchSnapshot();
  });
});
