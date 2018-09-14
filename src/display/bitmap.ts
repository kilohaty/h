import DisplayObject from './display-object';
import {loadImage} from '../utils/misc';

interface IBitmapOptions {
  visible?: boolean;
  left?: number;
  top?: number;
  src: string;
}

export default class Bitmap extends DisplayObject {
  readonly type: string = 'bitmap';
  readonly updateList: Array<string> = ['visible', 'left', 'top', 'src'];

  private bitmapSource: HTMLImageElement;

  public src: string;

  public constructor(options: IBitmapOptions) {
    super(null);
    this.set(options);
  }

  protected async update(key: string) {
    if (key === 'src') {
      try {
        this.bitmapSource = await loadImage(this.proxy.src);
        this.updateFlag = true;
      } catch (err) {
        console.error(err);
      }
      return;
    }

    this.updateFlag = true;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.bitmapSource) {
      this.updateFlag = false;
      return;
    }

    ctx.save();
    ctx.translate(this.left, this.top);
    ctx.drawImage(this.proxy.bitmapSource, 0, 0);
    ctx.restore();

    this.updateFlag = false;
  }

}