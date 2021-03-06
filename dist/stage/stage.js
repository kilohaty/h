import Layer from './layer';
import { throttle } from '../utils/misc';
var LONG_PRESS_DISTANCE = 5;
var Stage = /** @class */ (function () {
    function Stage(options) {
        this.forceRender = false;
        this.hookInit = false;
        this.animationFrameId = null;
        this.touchStartTime = 0;
        this.touchStartPoint = { x: 0, y: 0 };
        this.eventHandlers = {};
        this.layers = [];
        var el = options.el;
        var width = +options.width || 300;
        var height = +options.height || 150;
        this.pageScale = +options.pageScale || 1;
        this.container = typeof el === 'string' ? document.querySelector(el) : el;
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
        this.container.style.position = 'relative';
        this.width = width;
        this.height = height;
        this.throttleDelay = options.throttleDelay || 0;
        for (var i = 0; i < (options.layerNumber || 1); i++) {
            var layer = new Layer({
                container: this.container,
                width: this.width,
                height: this.height,
                layerIndex: i
            });
            this.layers.push(layer);
        }
        this.initEvents();
        this.initMobileEvents();
        this.animationFrameId = requestAnimationFrame(this.loopAnim.bind(this));
    }
    Stage.prototype.setPageScale = function (scale) {
        this.pageScale = scale;
    };
    Stage.prototype.resize = function (width, height) {
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
        this.width = width;
        this.height = height;
        this.layers.forEach(function (layer) { return layer.resize(width, height); });
        this.forceRender = true;
    };
    Stage.prototype.loopAnim = function () {
        this.renderObjects();
        this.animationFrameId = requestAnimationFrame(this.loopAnim.bind(this));
    };
    Stage.prototype.renderObjects = function () {
        var _this = this;
        this.layers.forEach(function (layer) {
            layer.renderObjects(_this.forceRender || layer.forceRender);
            layer.forceRender = false;
        });
        this.forceRender = false;
    };
    Stage.prototype.initEvents = function () {
        var _this = this;
        var eventMap = [
            {
                name: 'mouseenter',
                layerFuncName: 'onMouseEnter'
            },
            {
                name: 'mousemove',
                layerFuncName: 'onMouseMove',
                throttle: true
            },
            {
                name: 'mousedown',
                layerFuncName: 'onMouseDown'
            },
            {
                name: 'click',
                layerFuncName: 'onClick'
            },
            {
                name: 'mouseup',
                layerFuncName: 'onMouseUp'
            },
            {
                name: 'mouseleave',
                layerFuncName: 'onMouseLeave'
            },
            {
                name: 'contextmenu',
                layerFuncName: 'onContextMenu'
            },
        ];
        eventMap.forEach(function (_a) {
            var name = _a.name, layerFuncName = _a.layerFuncName, doThrottle = _a.throttle;
            var fn = function (e) {
                for (var i = _this.layers.length - 1; i >= 0; i--) {
                    var layer = _this.layers[i];
                    layer[layerFuncName].call(layer, e);
                }
            };
            var handler = doThrottle && _this.throttleDelay ? throttle(_this.throttleDelay, fn, false) : fn;
            _this.eventHandlers[name] = handler;
            _this.container.addEventListener(name, handler);
        });
    };
    Stage.prototype.initMobileEvents = function () {
        var _this = this;
        this.containerRect = this.container.getBoundingClientRect();
        // touchstart
        var touchStartHandler = function (e) {
            var touch = e.changedTouches[0];
            _this.touchStartPoint = { x: touch.clientX, y: touch.clientY };
            _this.touchStartTime = Date.now();
            var fn = function (e) {
                for (var i = _this.layers.length - 1; i >= 0; i--) {
                    var layer = _this.layers[i];
                    layer['onTouchStart'].call(layer, e);
                }
            };
            fn(_this.calcMobileEventPosition(touch));
        };
        this.eventHandlers['touchstart'] = touchStartHandler;
        this.container.addEventListener('touchstart', touchStartHandler);
        // touchmove
        var touchMoveHandler = function (e) {
            var touch = e.changedTouches[0];
            var fn = function (e) {
                for (var i = _this.layers.length - 1; i >= 0; i--) {
                    var layer = _this.layers[i];
                    layer['onTouchMove'].call(layer, e);
                }
            };
            var handler = _this.throttleDelay ? throttle(_this.throttleDelay, fn, false) : fn;
            handler(_this.calcMobileEventPosition(touch));
        };
        this.eventHandlers['touchmove'] = touchMoveHandler;
        this.container.addEventListener('touchmove', touchMoveHandler);
        // touchend
        var touchEndHandler = function (e) {
            var touch = e.changedTouches[0];
            var diffX = Math.abs(touch.clientX - _this.touchStartPoint.x);
            var diffY = Math.abs(touch.clientY - _this.touchStartPoint.y);
            var now = Date.now();
            if (now - _this.touchStartTime > 500 && diffX < LONG_PRESS_DISTANCE && diffY < LONG_PRESS_DISTANCE) {
                var fn = function (e) {
                    for (var i = _this.layers.length - 1; i >= 0; i--) {
                        var layer = _this.layers[i];
                        layer['onLongTap'].call(layer, e);
                    }
                };
                fn(_this.calcMobileEventPosition(touch));
            }
            else {
                var fn = function (e) {
                    for (var i = _this.layers.length - 1; i >= 0; i--) {
                        var layer = _this.layers[i];
                        layer['onTouchEnd'].call(layer, e);
                    }
                };
                fn(_this.calcMobileEventPosition(touch));
            }
        };
        this.eventHandlers['touchend'] = touchEndHandler;
        this.container.addEventListener('touchend', touchEndHandler);
    };
    Stage.prototype.calcMobileEventPosition = function (touch) {
        var offsetX = ~~(touch.clientX - this.containerRect.left) / (this.pageScale || 1);
        var offsetY = ~~(touch.clientY - this.containerRect.top) / (this.pageScale || 1);
        return { offsetX: offsetX, offsetY: offsetY };
    };
    Stage.prototype.removeEvents = function () {
        for (var type in this.eventHandlers) {
            if (this.eventHandlers.hasOwnProperty(type)) {
                this.container.removeEventListener(type, this.eventHandlers[type]);
            }
        }
    };
    Stage.prototype.stopAnim = function () {
        cancelAnimationFrame(this.animationFrameId);
    };
    Stage.prototype.destroy = function () {
        this.stopAnim();
        this.removeEvents();
    };
    return Stage;
}());
export default Stage;
//# sourceMappingURL=stage.js.map