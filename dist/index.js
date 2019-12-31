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
var defaultWrapperStyle = {
  display: "inline-block"
};

var getDisplayName = function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

var withHydrationOnDemandServerSide = function withHydrationOnDemandServerSide(WrappedComponent) {
  return function (_ref) {
    var wrapperProps = _ref.wrapperProps,
        props = (0, _objectWithoutProperties2["default"])(_ref, ["wrapperProps"]);
    return _react["default"].createElement("section", (0, _extends2["default"])({
      "data-hydration-on-demand": true,
      style: defaultWrapperStyle
    }, wrapperProps), _react["default"].createElement(WrappedComponent, props));
  };
};

var withHydrationOnDemandClientSide = function withHydrationOnDemandClientSide(_ref2) {
  var _ref2$disableFallback = _ref2.disableFallback,
      disableFallback = _ref2$disableFallback === void 0 ? false : _ref2$disableFallback,
      _ref2$onBefore = _ref2.onBefore,
      onBefore = _ref2$onBefore === void 0 ? Function.prototype : _ref2$onBefore,
      _ref2$on = _ref2.on,
      on = _ref2$on === void 0 ? [] : _ref2$on;
  return function (WrappedComponent) {
    var WithHydrationOnDemand = function WithHydrationOnDemand(_ref3) {
      var _ref3$forceHydration = _ref3.forceHydration,
          forceHydration = _ref3$forceHydration === void 0 ? false : _ref3$forceHydration,
          wrapperProps = _ref3.wrapperProps,
          props = (0, _objectWithoutProperties2["default"])(_ref3, ["forceHydration", "wrapperProps"]);
      var rootRef = (0, _react.useRef)(null);
      var cleanupFunctions = (0, _react.useRef)([]);

      var _useState = (0, _react.useState)(false),
          _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
          isHydrated = _useState2[0],
          setIsHydrated = _useState2[1];

      var cleanUp = function cleanUp() {
        cleanupFunctions.current.forEach(function (fn) {
          return fn();
        });
        cleanupFunctions.current = [];
      };

      var hydrate =
      /*#__PURE__*/
      function () {
        var _ref4 = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee() {
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
                  _context.next = 5;
                  return onBefore();

                case 5:
                  setIsHydrated(true);

                case 6:
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
        var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rootRef.current;
        target.addEventListener(type, hydrate, eventListenerOptions);
        cleanupFunctions.current.push(function () {
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

      var initIntersectionObserver = function initIntersectionObserver(options) {
        if (!("IntersectionObserver" in window)) {
          hydrate();
          return;
        }

        new IntersectionObserver(function (_ref5, observer) {
          var _ref6 = (0, _slicedToArray2["default"])(_ref5, 1),
              entry = _ref6[0];

          if (!entry.isIntersecting || !(entry.intersectionRatio > 0)) return;
          observer.disconnect();
          hydrate();
        }, options).observe(rootRef.current);
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
        var wasRenderedServerSide = !!rootRef.current.getAttribute("data-hydration-on-demand");
        var shouldHydrate = !wasRenderedServerSide && !disableFallback || forceHydration;
        if (shouldHydrate) hydrate();
      });
      (0, _react.useEffect)(function () {
        if (isHydrated || forceHydration) return;
        on.forEach(function (event) {
          return Array.isArray(event) ? initEvent.apply(void 0, (0, _toConsumableArray2["default"])(event)) : initEvent(event);
        });
      }, []);
      if (!isHydrated) return _react["default"].createElement("section", (0, _extends2["default"])({
        ref: rootRef,
        dangerouslySetInnerHTML: {
          __html: ""
        },
        suppressHydrationWarning: true,
        style: defaultWrapperStyle
      }, wrapperProps));
      return _react["default"].createElement("section", (0, _extends2["default"])({
        style: defaultWrapperStyle
      }, wrapperProps), _react["default"].createElement(WrappedComponent, props));
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
