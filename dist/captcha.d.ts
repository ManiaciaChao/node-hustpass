/// <reference types="node" />
declare module "gm" {
    interface State {
        selectFrame(frame: number): this;
    }
}
export declare const readCaptcha: (captcha: Buffer) => Promise<string | false>;
