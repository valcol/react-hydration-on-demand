import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import exenv from "exenv";

const isClientSide = exenv.canUseDOM;
// React 18+ can keep a Suspense boundary dehydrated and hydrate it later in
// place, so the server markup is reused instead of being re-created.
const supportsSuspenseHydration = parseInt(React.version, 10) >= 18;
const EMPTY_CONTENT = { __html: "" };

const eventListenerOptions = {
    once: true,
    capture: true,
    passive: true,
};

const getDisplayName = (WrappedComponent) => {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

const withHydrationOnDemandServerSide = (WrappedComponent) => {
    const WithHydrationOnDemand = ({
        forceHydration,
        wrapperProps,
        ...props
    }) => {
        const { as: WrapperComponent = "section", ...wrapperPropsRest } =
            wrapperProps || {};
        const content = <WrappedComponent {...props} />;

        return (
            <WrapperComponent data-hydration-on-demand={true} {...wrapperPropsRest}>
                {supportsSuspenseHydration ? (
                    <React.Suspense fallback={null}>{content}</React.Suspense>
                ) : (
                    content
                )}
            </WrapperComponent>
        );
    };

    WithHydrationOnDemand.displayName = `withHydrationOnDemand(${getDisplayName(
        WrappedComponent
    )})`;

    return WithHydrationOnDemand;
};

const withHydrationOnDemandLegacyClientSide =
    ({
        disableFallback = false,
        on = [],
        onBefore,
    }) =>
    (WrappedComponent) => {
        const WithHydrationOnDemand = ({
            forceHydration = false,
            wrapperProps = {},
            ...props
        }) => {
            const { as: WrapperComponent = 'section', ...wrapperPropsRest } = wrapperProps || {};
            const rootRef = useRef(null);
            const cleanupFunctions = useRef([]);

            const [isHydrated, setIsHydrated] = useState(
                forceHydration && !onBefore
            );

            const cleanUp = () => {
                cleanupFunctions.current.forEach((fn) => fn());
                cleanupFunctions.current = [];
            };

            const hydrate = async () => {
                cleanUp();
                if (isHydrated) return;

                if (onBefore) await onBefore();
                setIsHydrated(true);
            };

            const initDOMEvent = (type, getTarget = () => rootRef.current) => {
                const target = getTarget();
                target.addEventListener(type, hydrate, eventListenerOptions);
                cleanupFunctions.current.push(() => {
                    if (!target) return;
                    target.removeEventListener(
                        type,
                        hydrate,
                        eventListenerOptions
                    );
                });
            };

            const initTimeout = (delay = 2000) => {
                if (delay <= 0) return;

                const timeout = setTimeout(hydrate, delay);
                cleanupFunctions.current.push(() => clearTimeout(timeout));
            };

            const initIdleCallback = () => {
                if (!("requestIdleCallback" in window)) {
                    initTimeout();
                    return;
                }

                const idleCallback = requestIdleCallback(
                    () => requestAnimationFrame(() => hydrate()),
                    { timeout: 500 }
                );

                if (!("cancelIdleCallback" in window)) return;

                cleanupFunctions.current.push(() => {
                    cancelIdleCallback(idleCallback);
                });
            };

            const initIntersectionObserver = (
                getOptions = Function.prototype
            ) => {
                if (!("IntersectionObserver" in window)) {
                    hydrate();
                    return;
                }

                const options = getOptions();
                const observer = new IntersectionObserver(([entry]) => {
                    if (!entry.isIntersecting || !(entry.intersectionRatio > 0))
                        return;

                    hydrate();
                }, options);

                cleanupFunctions.current.push(() => {
                    if (!observer) return;
                    observer.disconnect();
                });

                observer.observe(rootRef.current);
            };

            const initEvent = (type, options) => {
                switch (type) {
                    case "delay":
                        initTimeout(options);
                        break;
                    case "visible":
                        initIntersectionObserver(options);
                        break;
                    case "idle":
                        initIdleCallback();
                        break;
                    default:
                        initDOMEvent(type, options);
                }
            };

            useLayoutEffect(() => {
                if (isHydrated) return;

                if (forceHydration) {
                    hydrate();
                    return;
                }

                const wasRenderedServerSide = !!rootRef.current.getAttribute(
                    "data-hydration-on-demand"
                );
                const shouldHydrate =
                    !wasRenderedServerSide && !disableFallback;

                if (shouldHydrate) hydrate();
            }, [forceHydration]);

            useEffect(() => {
                if (isHydrated) return;

                on.forEach((event) =>
                    Array.isArray(event)
                        ? initEvent(...event)
                        : initEvent(event)
                );
                return cleanUp;
            }, []);

            if (!isHydrated)
                return (
                    <WrapperComponent
                        ref={rootRef}
                        dangerouslySetInnerHTML={EMPTY_CONTENT}
                        suppressHydrationWarning
                        {...wrapperPropsRest}
                    />
                );

            return (
                <WrapperComponent {...wrapperPropsRest}>
                    <WrappedComponent {...props} />
                </WrapperComponent>
            );
        };

        WithHydrationOnDemand.displayName = `withHydrationOnDemand(${getDisplayName(
            WrappedComponent
        )})`;

        return WithHydrationOnDemand;
    };

// Suspends its subtree until the gate is opened. While the subtree is
// suspended during hydration, React keeps the server markup untouched.
const createHydrationGate = (isOpen) => {
    let open;
    const promise = isOpen
        ? null
        : new Promise((resolve) => {
              open = resolve;
          });

    return {
        isOpen,
        isTriggered: isOpen,
        promise,
        open() {
            this.isOpen = true;
            if (open) open();
        },
    };
};

const HydrationGate = ({ gate, onHydrated, children }) => {
    useLayoutEffect(onHydrated, []);

    if (!gate.isOpen) throw gate.promise;

    return children;
};

// Blocks every re-render until hydration is done: a dehydrated Suspense
// boundary receiving new props before it can hydrate is switched to client
// rendering by React, discarding the server markup. The boundary is hydrated
// with the props of the first render (the ones matching the server markup),
// then updated with the latest props once `isHydrated` flips.
const FrozenUntilHydrated = React.memo(
    ({ children }) => children,
    (prevProps, nextProps) => !nextProps.isHydrated
);

const withHydrationOnDemandSuspenseClientSide =
    ({
        disableFallback = false,
        on = [],
        onBefore,
    }) =>
    (WrappedComponent) => {
        const WithHydrationOnDemand = ({
            forceHydration = false,
            wrapperProps,
            ...props
        }) => {
            const { as: WrapperComponent = "section", ...wrapperPropsRest } =
                wrapperProps || {};
            const rootRef = useRef(null);
            const cleanupFunctions = useRef([]);

            const [isHydrated, setIsHydrated] = useState(
                forceHydration && !onBefore
            );
            const [gate] = useState(() => createHydrationGate(isHydrated));

            const onHydrated = () => {
                React.startTransition(() => setIsHydrated(true));
            };

            const cleanUp = () => {
                cleanupFunctions.current.forEach((fn) => fn());
                cleanupFunctions.current = [];
            };

            // Opens the gate synchronously when there is no `onBefore`, so a
            // discrete event (e.g. click) triggering the hydration can be
            // handled by React's synchronous selective hydration.
            const hydrate = () => {
                if (gate.isTriggered) return undefined;
                gate.isTriggered = true;
                cleanUp();

                if (!onBefore) {
                    gate.open();
                    return undefined;
                }

                return Promise.resolve(onBefore()).then(() => gate.open());
            };

            const initDOMEvent = (type, getTarget) => {
                if (getTarget) {
                    const target = getTarget();
                    if (!target) return;

                    target.addEventListener(type, hydrate, eventListenerOptions);
                    cleanupFunctions.current.push(() => {
                        target.removeEventListener(
                            type,
                            hydrate,
                            eventListenerOptions
                        );
                    });
                    return;
                }

                // Listen on the document capture phase, which runs before
                // React's own listener on the root container: the gate is
                // then already open when React tries to hydrate the boundary
                // to dispatch the event, so the component receives it.
                const root = rootRef.current;
                const document = root.ownerDocument;
                const listener = (event) => {
                    if (root.contains(event.target)) hydrate();
                };

                document.addEventListener(type, listener, eventListenerOptions.capture);
                cleanupFunctions.current.push(() => {
                    document.removeEventListener(
                        type,
                        listener,
                        eventListenerOptions.capture
                    );
                });
            };

            const initTimeout = (delay = 2000) => {
                if (delay <= 0) return;

                const timeout = setTimeout(hydrate, delay);
                cleanupFunctions.current.push(() => clearTimeout(timeout));
            };

            const initIdleCallback = () => {
                if (!("requestIdleCallback" in window)) {
                    initTimeout();
                    return;
                }

                let animationFrame;
                const idleCallback = requestIdleCallback(
                    () => {
                        animationFrame = requestAnimationFrame(() => hydrate());
                    },
                    { timeout: 500 }
                );

                cleanupFunctions.current.push(() => {
                    if ("cancelIdleCallback" in window)
                        cancelIdleCallback(idleCallback);
                    if (animationFrame) cancelAnimationFrame(animationFrame);
                });
            };

            const initIntersectionObserver = (
                getOptions = Function.prototype
            ) => {
                if (!("IntersectionObserver" in window)) {
                    hydrate();
                    return;
                }

                const options = getOptions();
                const observer = new IntersectionObserver(([entry]) => {
                    if (!entry.isIntersecting || !(entry.intersectionRatio > 0))
                        return;

                    hydrate();
                }, options);

                cleanupFunctions.current.push(() => observer.disconnect());

                observer.observe(rootRef.current);
            };

            const initEvent = (type, options) => {
                switch (type) {
                    case "delay":
                        initTimeout(options);
                        break;
                    case "visible":
                        initIntersectionObserver(options);
                        break;
                    case "idle":
                        initIdleCallback();
                        break;
                    default:
                        initDOMEvent(type, options);
                }
            };

            useLayoutEffect(() => {
                if (gate.isTriggered) return;

                if (forceHydration) {
                    hydrate();
                    return;
                }

                const wasRenderedServerSide = !!rootRef.current.getAttribute(
                    "data-hydration-on-demand"
                );
                if (wasRenderedServerSide || disableFallback) return;

                // Not server rendered: render the component right away. The
                // boundary is client rendered, so unfreezing it immediately is
                // safe and avoids painting the empty fallback.
                hydrate();
                if (gate.isOpen) setIsHydrated(true);
            }, [forceHydration]);

            useEffect(() => {
                if (gate.isTriggered) return undefined;

                on.forEach((event) =>
                    Array.isArray(event)
                        ? initEvent(...event)
                        : initEvent(event)
                );
                return cleanUp;
            }, []);

            return (
                <WrapperComponent
                    ref={rootRef}
                    suppressHydrationWarning
                    {...wrapperPropsRest}
                >
                    <FrozenUntilHydrated isHydrated={isHydrated}>
                        <React.Suspense fallback={null}>
                            <HydrationGate gate={gate} onHydrated={onHydrated}>
                                <WrappedComponent {...props} />
                            </HydrationGate>
                        </React.Suspense>
                    </FrozenUntilHydrated>
                </WrapperComponent>
            );
        };

        WithHydrationOnDemand.displayName = `withHydrationOnDemand(${getDisplayName(
            WrappedComponent
        )})`;

        return WithHydrationOnDemand;
    };

const withHydrationOnDemand = (options = {}) => {
    if (!isClientSide) return withHydrationOnDemandServerSide;

    return supportsSuspenseHydration
        ? withHydrationOnDemandSuspenseClientSide(options)
        : withHydrationOnDemandLegacyClientSide(options);
};

export default withHydrationOnDemand;
