import DisplayObject from './display-object';
import { IDisplayObjectOptions } from './display-object';
import IPoint from "../utils/point";
interface IStatusFrame {
    [index: number]: {
        x: number;
        y: number;
        w: number;
        h: number;
        cx: number;
        cy: number;
    };
    l: number;
    src?: string;
    d: number;
    i?: number;
}
interface IFrames {
    [propName: string]: IStatusFrame;
}
export interface ISpriteOptions extends IDisplayObjectOptions {
    src?: string;
    frames: IFrames;
    status: string;
}
export default class Sprite extends DisplayObject {
    readonly type: string;
    private paused;
    private bitmapSource;
    private lastFrameTime;
    private frameIndex;
    private iteratedCount;
    private statusEndCallbacks;
    src: string;
    frames: IFrames;
    status: string;
    playbackRate: number;
    static updateList: Array<string>;
    constructor(options: ISpriteOptions);
    protected update(key: string): Promise<void>;
    setStatus(status: string, animationEndCallback: Function, onlyOnce?: boolean): Sprite;
    private addStatusEndCallback;
    private onStatusEnd;
    private reset;
    private isAnimationEnd;
    protected _render(ctx: CanvasRenderingContext2D): void;
    pause(): void;
    resume(): void;
    replay(): void;
    protected _isPointOnObject(point: IPoint): boolean;
}
export {};
