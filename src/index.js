import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import exenv from "exenv";

const isClientSide = exenv.canUseDOM;

const eventListenerOptions = {
    once: true,
    capture: true,
    passive: true,
};

const getDisplayName = (WrappedComponent) => {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

const withHydrationOnDemandServerSide = (WrappedComponent) => ({
    wrapperProps,
    ...props
}) => (
    <section data-hydration-on-demand={true} {...wrapperProps}>
        <WrappedComponent {...props} />
    </section>
);

const withHydrationOnDemandClientSide = ({
    disableFallback = false,
    isInputPendingFallbackValue = true,
    on = [],
    onBefore = Function.prototype,
    whenInputPending = false,
}) => (WrappedComponent) => {
    const WithHydrationOnDemand = ({
        forceHydration = false,
        wrapperProps,
        ...props
    }) => {
        const rootRef = useRef(null);
        const cleanupFunctions = useRef([]);
        const [isHydrated, setIsHydrated] = useState(false);

        const cleanUp = () => {
            cleanupFunctions.current.forEach((fn) => fn());
            cleanupFunctions.current = [];
        };

        const hydrate = async () => {
            cleanUp();
            if (isHydrated) return;

            await onBefore();                           
            setIsHydrated(true); 
        };

        const isInputPending = () => {
            const isInputPending = navigator?.scheduling?.isInputPending?.();
            return isInputPending ?? isInputPendingFallbackValue;
        }

        const initDOMEvent = (type, getTarget = () => rootRef.current) => {
            const target = getTarget();
            target.addEventListener(type, hydrate, eventListenerOptions);
            cleanupFunctions.current.push(() => {
                if (!target) return;
                target.removeEventListener(type, hydrate, eventListenerOptions);
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

        const initIntersectionObserver = (getOptions = Function.prototype) => {
            if (!("IntersectionObserver" in window)) {
                hydrate();
                return;
            }

            const options = getOptions();
            const observer = new IntersectionObserver(([entry], observer) => {
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

            if (forceHydration){
                hydrate();
                return;
            }

            const wasRenderedServerSide = !!rootRef.current.getAttribute(
                "data-hydration-on-demand"
            );
            const shouldHydrate =
                (!wasRenderedServerSide && !disableFallback) || (whenInputPending && !isInputPending());
            if (shouldHydrate) hydrate();
        }, [forceHydration]);

        useEffect(() => {
            if (isHydrated || forceHydration) return;
            on.forEach((event) =>
                Array.isArray(event) ? initEvent(...event) : initEvent(event)
            );
            return cleanUp;
        }, []);

        if (!isHydrated)
            return (
                <section
                    ref={rootRef}
                    dangerouslySetInnerHTML={{ __html: "" }}
                    suppressHydrationWarning
                    {...wrapperProps}
                />
            );

        return (
            <section {...wrapperProps}>
                <WrappedComponent {...props} />
            </section>
        );
    };

    WithHydrationOnDemand.displayName = `withHydrationOnDemand(${getDisplayName(
        WrappedComponent
    )})`;

    return WithHydrationOnDemand;
};
const withHydrationOnDemand = (options = {}) => {
    if (isClientSide) return withHydrationOnDemandClientSide(options);

    return withHydrationOnDemandServerSide;
};

export default withHydrationOnDemand;
