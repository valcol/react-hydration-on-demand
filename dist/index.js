"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _exenv = _interopRequireDefault(require("exenv"));

var isClientSide = _exenv["default"].canUseDOM;
var eventListenerOptions = {
  once: true,
  capture: true,
  passive: true
};

var getDisplayName = function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

var withHydrationOnDemandServerSide = function withHydrationOnDemandServerSide(WrappedComponent) {
  return function (_ref) {
    var wrapperProps = _ref.wrapperProps,
        props = (0, _objectWithoutProperties2["default"])(_ref, ["wrapperProps"]);
    return /*#__PURE__*/_react["default"].createElement("section", (0, _extends2["default"])({
      "data-hydration-on-demand": true
    }, wrapperProps), /*#__PURE__*/_react["default"].createElement(WrappedComponent, props));
  };
};

var withHydrationOnDemandClientSide = function withHydrationOnDemandClientSide(_ref2) {
  var _ref2$disableFallback = _ref2.disableFallback,
      disableFallback = _ref2$disableFallback === void 0 ? false : _ref2$disableFallback,
      _ref2$isInputPendingF = _ref2.isInputPendingFallbackValue,
      isInputPendingFallbackValue = _ref2$isInputPendingF === void 0 ? true : _ref2$isInputPendingF,
      _ref2$on = _ref2.on,
      on = _ref2$on === void 0 ? [] : _ref2$on,
      onBefore = _ref2.onBefore,
      _ref2$whenInputPendin = _ref2.whenInputPending,
      whenInputPending = _ref2$whenInputPendin === void 0 ? false : _ref2$whenInputPendin;
  return function (WrappedComponent) {
    var WithHydrationOnDemand = function WithHydrationOnDemand(_ref3) {
      var _ref3$forceHydration = _ref3.forceHydration,
          forceHydration = _ref3$forceHydration === void 0 ? false : _ref3$forceHydration,
          wrapperProps = _ref3.wrapperProps,
          props = (0, _objectWithoutProperties2["default"])(_ref3, ["forceHydration", "wrapperProps"]);
      var rootRef = (0, _react.useRef)(null);
      var cleanupFunctions = (0, _react.useRef)([]);

      var isInputPending = function isInputPending() {
        var _navigator, _navigator$scheduling, _navigator$scheduling2;

        var isInputPending = (_navigator = navigator) === null || _navigator === void 0 ? void 0 : (_navigator$scheduling = _navigator.scheduling) === null || _navigator$scheduling === void 0 ? void 0 : (_navigator$scheduling2 = _navigator$scheduling.isInputPending) === null || _navigator$scheduling2 === void 0 ? void 0 : _navigator$scheduling2.call(_navigator$scheduling);
        return isInputPending !== null && isInputPending !== void 0 ? isInputPending : isInputPendingFallbackValue;
      };

      var getDefaultHydrationState = function getDefaultHydrationState() {
        var isNotInputPending = whenInputPending && !isInputPending();
        return (isNotInputPending || forceHydration) && !onBefore;
      };

      var _useState = (0, _react.useState)(getDefaultHydrationState()),
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
        var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
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
            }
          }, _callee);
        }));

        return function hydrate() {
          return _ref4.apply(this, arguments);
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
        var observer = new IntersectionObserver(function (_ref5) {
          var _ref6 = (0, _slicedToArray2["default"])(_ref5, 1),
              entry = _ref6[0];

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
      if (!isHydrated) return /*#__PURE__*/_react["default"].createElement("section", (0, _extends2["default"])({
        ref: rootRef,
        dangerouslySetInnerHTML: {
          __html: ""
        },
        suppressHydrationWarning: true
      }, wrapperProps));
      return /*#__PURE__*/_react["default"].createElement("section", wrapperProps, /*#__PURE__*/_react["default"].createElement(WrappedComponent, props));
    };

    WithHydrationOnDemand.displayName = "withHydrationOnDemand(".concat(getDisplayName(WrappedComponent), ")");
    return WithHydrationOnDemand;
  };
};

var withHydrationOnDemand = function withHydrationOnDemand() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (isClientSide) return withHydrationOnDemandClientSide(options);
  return withHydrationOnDemandServerSide;
};

var _default = withHydrationOnDemand;
exports["default"] = _default;
