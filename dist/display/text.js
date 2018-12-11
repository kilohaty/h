import * as tslib_1 from "tslib";
import DisplayObject from './display-object';
import { isPointInRect } from '../utils/misc';
import TextHelper from '../utils/text-helper';
var DEFAULT_FONT_FAMILY = '"PingFang SC", Verdana, "Helvetica Neue", "Microsoft Yahei", "Hiragino Sans GB", "Microsoft Sans Serif", "WenQuanYi Micro Hei", sans-serif';
var Text = /** @class */ (function (_super) {
    tslib_1.__extends(Text, _super);
    function Text(options) {
        var _this = _super.call(this, null) || this;
        _this.type = 'text';
        _this.fontSize = 14;
        _this.fontWeight = 'normal';
        _this.fontFamily = DEFAULT_FONT_FAMILY;
        _this.color = '#000000';
        _this.set(options);
        return _this;
    }
    Text.prototype.update = function (key) {
        if (['text', 'fontSize', 'fontWeight', 'fontFamily'].indexOf(key) !== -1) {
            this.calcDimensions();
        }
        this.updateFlag = true;
    };
    Text.prototype.calcDimensions = function () {
        if (!this.text || !this.fontSize) {
            this.width = this.height = 0;
            return;
        }
        var cssText = "\n      font-family: " + this.fontFamily + ";\n      font-size: " + this.fontSize + "px;\n      font-weight: " + this.fontWeight + ";\n    ";
        var dimensions = TextHelper.measureText(this.text, cssText);
        this.width = dimensions.width;
        this.height = dimensions.height;
    };
    Text.prototype._render = function (ctx) {
        var dstX = this.scaleX < 0 ? -this.width : 0;
        var dstY = this.scaleY < 0 ? -this.height : 0;
        ctx.save();
        ctx.translate(this.getLeft(), this.getTop());
        ctx.scale(this.scaleX, this.scaleY);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.color;
        ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFamily;
        ctx.fillText(this.text, dstX, dstY);
        ctx.strokeRect(dstX, dstY, this.width, this.height);
        ctx.restore();
        this.updateFlag = false;
    };
    Text.prototype._isPointOnObject = function (point) {
        return isPointInRect({
            left: this.getLeft(),
            top: this.getTop(),
            width: this.getWidth(),
            height: this.getHeight(),
            angle: 0
        }, point);
    };
    Text.updateList = tslib_1.__spread(DisplayObject.updateList, ['text', 'fontSize', 'fontWeight', 'fontFamily', 'color']);
    return Text;
}(DisplayObject));
export default Text;
//# sourceMappingURL=text.js.map