"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _exenv = _interopRequireDefault(require("exenv"));
var _excluded = ["forceHydration", "wrapperProps"],
  _excluded2 = ["as"],
  _excluded3 = ["forceHydration", "wrapperProps"],
  _excluded4 = ["as"],
  _excluded5 = ["forceHydration", "wrapperProps"],
  _excluded6 = ["as"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var isClientSide = _exenv["default"].canUseDOM;
// React 18+ can keep a Suspense boundary dehydrated and hydrate it later in
// place, so the server markup is reused instead of being re-created.
// This requires a root created with `hydrateRoot`: a legacy `ReactDOM.hydrate`
// root can't keep the boundary dehydrated and would drop the server markup.
// There's no public API to detect the root type, so this is documented instead.
var supportsSuspenseHydration = parseInt(_react["default"].version, 10) >= 18;
var EMPTY_CONTENT = {
  __html: ""
};
var eventListenerOptions = {
  once: true,
  capture: true,
  passive: true
};
var getDisplayName = function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};
var withHydrationOnDemandServerSide = function withHydrationOnDemandServerSide(WrappedComponent) {
  var WithHydrationOnDemand = function WithHydrationOnDemand(_ref) {
    var forceHydration = _ref.forceHydration,
      wrapperProps = _ref.wrapperProps,
      props = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
    var _ref2 = wrapperProps || {},
      _ref2$as = _ref2.as,
      WrapperComponent = _ref2$as === void 0 ? "section" : _ref2$as,
      wrapperPropsRest = (0, _objectWithoutProperties2["default"])(_ref2, _excluded2);
    var content = /*#__PURE__*/_react["default"].createElement(WrappedComponent, props);
    return /*#__PURE__*/_react["default"].createElement(WrapperComponent, (0, _extends2["default"])({
      "data-hydration-on-demand": true
    }, wrapperPropsRest), supportsSuspenseHydration ? /*#__PURE__*/_react["default"].createElement(_react["default"].Suspense, {
      fallback: null
    }, content) : content);
  };
  WithHydrationOnDemand.displayName = "withHydrationOnDemand(".concat(getDisplayName(WrappedComponent), ")");
  return WithHydrationOnDemand;
};
var withHydrationOnDemandLegacyClientSide = function withHydrationOnDemandLegacyClientSide(_ref3) {
  var _ref3$disableFallback = _ref3.disableFallback,
    disableFallback = _ref3$disableFallback === void 0 ? false : _ref3$disableFallback,
    _ref3$on = _ref3.on,
    on = _ref3$on === void 0 ? [] : _ref3$on,
    onBefore = _ref3.onBefore;
  return function (WrappedComponent) {
    var WithHydrationOnDemand = function WithHydrationOnDemand(_ref4) {
      var _ref4$forceHydration = _ref4.forceHydration,
        forceHydration = _ref4$forceHydration === void 0 ? false : _ref4$forceHydration,
        _ref4$wrapperProps = _ref4.wrapperProps,
        wrapperProps = _ref4$wrapperProps === void 0 ? {} : _ref4$wrapperProps,
        props = (0, _objectWithoutProperties2["default"])(_ref4, _excluded3);
      var _ref5 = wrapperProps || {},
        _ref5$as = _ref5.as,
        WrapperComponent = _ref5$as === void 0 ? 'section' : _ref5$as,
        wrapperPropsRest = (0, _objectWithoutProperties2["default"])(_ref5, _excluded4);
      var rootRef = (0, _react.useRef)(null);
      var cleanupFunctions = (0, _react.useRef)([]);
      var _useState = (0, _react.useState)(forceHydration && !onBefore),
        _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
        isHydrated = _useState2[0],
        setIsHydrated = _useState2[1];
      var cleanUp = function cleanUp() {
        cleanupFunctions.current.forEach(function (fn) {
          return fn();
        });
        cleanupFunctions.current = [];
      };
      var hydrate = /*#__PURE__*/function () {
        var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                cleanUp();
                if (!isHydrated) {
                  _context.next = 3;
                  break;
                }
                return _context.abrupt("return");
              case 3:
                if (!onBefore) {
                  _context.next = 6;
                  break;
                }
                _context.next = 6;
                return onBefore();
              case 6:
                setIsHydrated(true);
              case 7:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function hydrate() {
          return _ref6.apply(this, arguments);
        };
      }();
      var initDOMEvent = function initDOMEvent(type) {
        var getTarget = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
          return rootRef.current;
        };
        var target = getTarget();
        target.addEventListener(type, hydrate, eventListenerOptions);
        cleanupFunctions.current.push(function () {
          if (!target) return;
          target.removeEventListener(type, hydrate, eventListenerOptions);
        });
      };
      var initTimeout = function initTimeout() {
        var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;
        if (delay <= 0) return;
        var timeout = setTimeout(hydrate, delay);
        cleanupFunctions.current.push(function () {
          return clearTimeout(timeout);
        });
      };
      var initIdleCallback = function initIdleCallback() {
        if (!("requestIdleCallback" in window)) {
          initTimeout();
          return;
        }
        var idleCallback = requestIdleCallback(function () {
          return requestAnimationFrame(function () {
            return hydrate();
          });
        }, {
          timeout: 500
        });
        if (!("cancelIdleCallback" in window)) return;
        cleanupFunctions.current.push(function () {
          cancelIdleCallback(idleCallback);
        });
      };
      var initIntersectionObserver = function initIntersectionObserver() {
        var getOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Function.prototype;
        if (!("IntersectionObserver" in window)) {
          hydrate();
          return;
        }
        var options = getOptions();
        var observer = new IntersectionObserver(function (_ref7) {
          var _ref8 = (0, _slicedToArray2["default"])(_ref7, 1),
            entry = _ref8[0];
          if (!entry.isIntersecting || !(entry.intersectionRatio > 0)) return;
          hydrate();
        }, options);
        cleanupFunctions.current.push(function () {
          if (!observer) return;
          observer.disconnect();
        });
        observer.observe(rootRef.current);
      };
      var initEvent = function initEvent(type, options) {
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
      (0, _react.useLayoutEffect)(function () {
        if (isHydrated) return;
        if (forceHydration) {
          hydrate();
          return;
        }
        var wasRenderedServerSide = !!rootRef.current.getAttribute("data-hydration-on-demand");
        var shouldHydrate = !wasRenderedServerSide && !disableFallback;
        if (shouldHydrate) hydrate();
      }, [forceHydration]);
      (0, _react.useEffect)(function () {
        if (isHydrated) return;
        on.forEach(function (event) {
          return Array.isArray(event) ? initEvent.apply(void 0, (0, _toConsumableArray2["default"])(event)) : initEvent(event);
        });
        return cleanUp;
      }, []);
      if (!isHydrated) return /*#__PURE__*/_react["default"].createElement(WrapperComponent, (0, _extends2["default"])({
        ref: rootRef,
        dangerouslySetInnerHTML: EMPTY_CONTENT,
        suppressHydrationWarning: true
      }, wrapperPropsRest));
      return /*#__PURE__*/_react["default"].createElement(WrapperComponent, wrapperPropsRest, /*#__PURE__*/_react["default"].createElement(WrappedComponent, props));
    };
    WithHydrationOnDemand.displayName = "withHydrationOnDemand(".concat(getDisplayName(WrappedComponent), ")");
    return WithHydrationOnDemand;
  };
};

// Suspends its subtree until the gate is opened. While the subtree is
// suspended during hydration, React keeps the server markup untouched.
var createHydrationGate = function createHydrationGate(isOpen) {
  var _open;
  var promise = isOpen ? null : new Promise(function (resolve) {
    _open = resolve;
  });
  return {
    isOpen: isOpen,
    isTriggered: isOpen,
    promise: promise,
    open: function open() {
      this.isOpen = true;
      if (_open) _open();
    }
  };
};
var HydrationGate = function HydrationGate(_ref9) {
  var gate = _ref9.gate,
    onHydrated = _ref9.onHydrated,
    children = _ref9.children;
  (0, _react.useLayoutEffect)(onHydrated, []);
  if (!gate.isOpen) throw gate.promise;
  return children;
};

// Blocks every re-render until hydration is done: a dehydrated Suspense
// boundary receiving new props before it can hydrate is switched to client
// rendering by React, discarding the server markup. The boundary is hydrated
// with the props of the first render (the ones matching the server markup),
// then updated with the latest props once `isHydrated` flips.
var FrozenUntilHydrated = /*#__PURE__*/_react["default"].memo(function (_ref0) {
  var children = _ref0.children;
  return children;
}, function (prevProps, nextProps) {
  return !nextProps.isHydrated;
});
var withHydrationOnDemandSuspenseClientSide = function withHydrationOnDemandSuspenseClientSide(_ref1) {
  var _ref1$disableFallback = _ref1.disableFallback,
    disableFallback = _ref1$disableFallback === void 0 ? false : _ref1$disableFallback,
    _ref1$on = _ref1.on,
    on = _ref1$on === void 0 ? [] : _ref1$on,
    onBefore = _ref1.onBefore;
  return function (WrappedComponent) {
    var WithHydrationOnDemand = function WithHydrationOnDemand(_ref10) {
      var _ref10$forceHydration = _ref10.forceHydration,
        forceHydration = _ref10$forceHydration === void 0 ? false : _ref10$forceHydration,
        wrapperProps = _ref10.wrapperProps,
        props = (0, _objectWithoutProperties2["default"])(_ref10, _excluded5);
      var _ref11 = wrapperProps || {},
        _ref11$as = _ref11.as,
        WrapperComponent = _ref11$as === void 0 ? "section" : _ref11$as,
        wrapperPropsRest = (0, _objectWithoutProperties2["default"])(_ref11, _excluded6);
      var rootRef = (0, _react.useRef)(null);
      var cleanupFunctions = (0, _react.useRef)([]);
      var _useState3 = (0, _react.useState)(forceHydration && !onBefore),
        _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
        isHydrated = _useState4[0],
        setIsHydrated = _useState4[1];
      var _useState5 = (0, _react.useState)(function () {
          return createHydrationGate(isHydrated);
        }),
        _useState6 = (0, _slicedToArray2["default"])(_useState5, 1),
        gate = _useState6[0];
      var onHydrated = function onHydrated() {
        _react["default"].startTransition(function () {
          return setIsHydrated(true);
        });
      };
      var cleanUp = function cleanUp() {
        cleanupFunctions.current.forEach(function (fn) {
          return fn();
        });
        cleanupFunctions.current = [];
      };

      // Opens the gate synchronously when there is no `onBefore`, so a
      // discrete event (e.g. click) triggering the hydration can be
      // handled by React's synchronous selective hydration.
      var hydrate = function hydrate() {
        if (gate.isTriggered) return undefined;
        gate.isTriggered = true;
        cleanUp();
        if (!onBefore) {
          gate.open();
          return undefined;
        }
        return Promise.resolve(onBefore()).then(function () {
          return gate.open();
        });
      };
      var initDOMEvent = function initDOMEvent(type, getTarget) {
        if (getTarget) {
          var target = getTarget();
          if (!target) return;
          target.addEventListener(type, hydrate, eventListenerOptions);
          cleanupFunctions.current.push(function () {
            target.removeEventListener(type, hydrate, eventListenerOptions);
          });
          return;
        }

        // Listen on the document capture phase, which runs before
        // React's own listener on the root container: the gate is
        // then already open when React tries to hydrate the boundary
        // to dispatch the event, so the component receives it.
        var root = rootRef.current;
        var document = root.ownerDocument;
        var listener = function listener(event) {
          if (root.contains(event.target)) hydrate();
        };
        document.addEventListener(type, listener, eventListenerOptions.capture);
        cleanupFunctions.current.push(function () {
          document.removeEventListener(type, listener, eventListenerOptions.capture);
        });
      };
      var initTimeout = function initTimeout() {
        var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;
        if (delay <= 0) return;
        var timeout = setTimeout(hydrate, delay);
        cleanupFunctions.current.push(function () {
          return clearTimeout(timeout);
        });
      };
      var initIdleCallback = function initIdleCallback() {
        if (!("requestIdleCallback" in window)) {
          initTimeout();
          return;
        }
        var animationFrame;
        var idleCallback = requestIdleCallback(function () {
          animationFrame = requestAnimationFrame(function () {
            return hydrate();
          });
        }, {
          timeout: 500
        });
        cleanupFunctions.current.push(function () {
          if ("cancelIdleCallback" in window) cancelIdleCallback(idleCallback);
          if (animationFrame) cancelAnimationFrame(animationFrame);
        });
      };
      var initIntersectionObserver = function initIntersectionObserver() {
        var getOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Function.prototype;
        if (!("IntersectionObserver" in window)) {
          hydrate();
          return;
        }
        var options = getOptions();
        var observer = new IntersectionObserver(function (_ref12) {
          var _ref13 = (0, _slicedToArray2["default"])(_ref12, 1),
            entry = _ref13[0];
          if (!entry.isIntersecting || !(entry.intersectionRatio > 0)) return;
          hydrate();
        }, options);
        cleanupFunctions.current.push(function () {
          return observer.disconnect();
        });
        observer.observe(rootRef.current);
      };
      var initEvent = function initEvent(type, options) {
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
      (0, _react.useLayoutEffect)(function () {
        if (gate.isTriggered) return;
        if (forceHydration) {
          hydrate();
          return;
        }
        var wasRenderedServerSide = !!rootRef.current.getAttribute("data-hydration-on-demand");
        if (wasRenderedServerSide || disableFallback) return;

        // Not server rendered: render the component right away. The
        // boundary is client rendered, so unfreezing it immediately is
        // safe and avoids painting the empty fallback.
        hydrate();
        if (gate.isOpen) setIsHydrated(true);
      }, [forceHydration]);
      (0, _react.useEffect)(function () {
        if (gate.isTriggered) return undefined;
        on.forEach(function (event) {
          return Array.isArray(event) ? initEvent.apply(void 0, (0, _toConsumableArray2["default"])(event)) : initEvent(event);
        });
        return cleanUp;
      }, []);
      return /*#__PURE__*/_react["default"].createElement(WrapperComponent, (0, _extends2["default"])({
        ref: rootRef,
        suppressHydrationWarning: true
      }, wrapperPropsRest), /*#__PURE__*/_react["default"].createElement(FrozenUntilHydrated, {
        isHydrated: isHydrated
      }, /*#__PURE__*/_react["default"].createElement(_react["default"].Suspense, {
        fallback: null
      }, /*#__PURE__*/_react["default"].createElement(HydrationGate, {
        gate: gate,
        onHydrated: onHydrated
      }, /*#__PURE__*/_react["default"].createElement(WrappedComponent, props)))));
    };
    WithHydrationOnDemand.displayName = "withHydrationOnDemand(".concat(getDisplayName(WrappedComponent), ")");
    return WithHydrationOnDemand;
  };
};
var withHydrationOnDemand = function withHydrationOnDemand() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!isClientSide) return withHydrationOnDemandServerSide;
  return supportsSuspenseHydration ? withHydrationOnDemandSuspenseClientSide(options) : withHydrationOnDemandLegacyClientSide(options);
};
var _default = exports["default"] = withHydrationOnDemand;
