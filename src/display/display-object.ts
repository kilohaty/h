import UID from '../utils/uid';
import IPoint from '../utils/point';

const {abs} = Math;

export interface IDisplayObjectOptions {
  visible?: boolean;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  originX?: string;
  originY?: string;
  scaleX?: number;
  scaleY?: number;
}

export default abstract class DisplayObject {
  readonly type: string = 'displayObject';
  readonly id: number;
  readonly proxy: any;

  protected updateFlag: boolean = false;

  public visible: boolean = true;
  public left: number = 0;
  public top: number = 0;
  public width: number = 0;
  public height: number = 0;
  public originX: string = 'left';
  public originY: string = 'top';
  public scaleX: number = 1;
  public scaleY: number = 1;

  public static updateList: Array<string> = ['visible', 'left', 'top', 'originX', 'originY'];

  protected constructor(options: IDisplayObjectOptions) {
    this.id = UID.gen();
    this.proxy = new Proxy(this, {
      get: (target, key, receiver) => {
        return Reflect.get(target, key, receiver);
      },
      set: (target, key, value, receiver) => {
        Reflect.set(target, key, value, receiver);
        if (receiver.constructor.updateList.indexOf(String(key)) !== -1) {
          this.update(String(key));
        }
        return true;
      }
    });
    this.set(options);

    return this.proxy;
  }

  protected update(key: string) {
    this.updateFlag = true;
  }

  public set(options: any) {
    if (typeof options === 'object') {
      for (let key in options) {
        if (options.hasOwnProperty(key)) {
          this[key] = options[key];
        }
      }
    }
  }

  public needUpdate(): boolean {
    return this.updateFlag;
  }

  public abstract render(ctx: CanvasRenderingContext2D): void;

  public getWidth(): number {
    return abs(this.width * this.scaleX);
  };

  public getHeight(): number {
    return abs(this.height * this.scaleY);
  };

  public getOriginPoint(): IPoint {
    let x = this.originX === 'center' ? this.width / 2
      : this.originX === 'right' ? this.width : 0;
    let y = this.originY === 'center' ? this.height / 2
      : this.originY === 'bottom' ? this.height : 0;

    x = abs(x * this.scaleX);
    y = abs(y * this.scaleY);

    return {x: x, y: y};
  }

}
