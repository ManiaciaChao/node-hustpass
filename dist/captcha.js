"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tesseract_js_1 = require("tesseract.js");
const gm = require("gm");
const im = gm.subClass({ imageMagick: true });
const processImage = (buffer) => new Promise((resolve, reject) => {
    im(buffer)
        .selectFrame(1)
        .threshold(90, true)
        .in("-morphology", "close:2", "1x4: 0,1,1,0")
        .crop(84, 20, 0, 18) // original image size: 90x58
        .normalize()
        .toBuffer("png", (err, buffer) => {
        if (err)
            reject(err);
        if (buffer)
            resolve(buffer);
    });
});
exports.readCaptcha = async (captcha) => {
    const after = await processImage(captcha);
    const worker = tesseract_js_1.createWorker({
        langPath: "https://file-1252889006.cos.ap-guangzhou.myqcloud.com/tesseract",
    });
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng", 0 /* TESSERACT_ONLY */);
    await worker.setParameters({
        tessedit_pageseg_mode: "7" /* SINGLE_LINE */,
        tessedit_char_whitelist: "0123456789",
    });
    const { data: { text }, } = await worker.recognize(after);
    await worker.terminate();
    const code = text.replace(/[ \n]/g, "");
    if (code.length !== 4)
        return false;
    return code;
};
