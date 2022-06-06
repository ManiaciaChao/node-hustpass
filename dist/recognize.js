/**
 * This file was originally written by winderica
 */
import sharp from "sharp";
// https://github.com/winderica/DailyReport/blob/4ab18c3850e60ba3074db4f2fcb76695c0335ab8/assets/digits.png
const digitsStr = `iVBORw0KGgoAAAANSUhEUgAAALQAAAAUBAMAAADW/wrvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAwUExURQAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFulh5UAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFiSURBVEjHhZULEsMgCESXG8D9L9sYgV1snXamieHzJIAE8fwAi/3zvfCUPHdEqZZoCUqWSlAkmse2lHYSCUo0DjTSiOjipDtKlyJTL0fvmtv6MJ5o1y2exYvef0G/6+ciyarNYrxEJXLvkV75gMrha+hMeiXCK0c+0LTcT8EQM0xDrw6HQucdNtG4oO2GPvqBIk+7BtKy8rF2W16epTT06je6CxtdoVJLy7Jl4j+aDVZhsfjp2c0TbFmrKuGK7ufyCkGzCSFBC9reywVdwSa7qxN55LwvLMBoayaEGdQ4CNLmYUK7xHnjG9kqTpVA0dq06POqPYPhJWLLcG5o7az/aDkS49Wgou+Dc0NLQJ0PGxm1n2gN+jzwIXNCE36g34C8pkpItyck5EBv1+Bw7cwad+RMWw/dqj1cMcelJEYkMlwbfXhhy+KKti/0+FrowMK0QfRn5wsdQo75iaIO8wi0JuIDUWRHd/3sb80AAAAASUVORK5CYII=`;
const transpose = (data, width) => {
    return [...new Array(width).keys()].map((i) => [...data].filter((_, j) => j % width === i));
};
const match = (pixels, digits) => {
    const scores = [...new Array(10)].map(() => 0);
    for (let i = 0; i < 180; i++) {
        for (let j = 0; j < 20; j++) {
            if (pixels[i % 18][j] === digits[i][j]) {
                scores[~~(i / 18)]++;
            }
        }
    }
    return scores.indexOf(Math.max(...scores));
};
export const recognize = async (buffer) => {
    const data = await sharp(buffer, { page: 1 })
        .extract({ left: 0, top: 19, width: 87, height: 20 })
        .toColourspace("b-w")
        .threshold(254)
        .raw()
        .toBuffer();
    const digitsImage = Buffer.from(digitsStr, "base64");
    const digits = transpose(await sharp(digitsImage).toColourspace("b-w").raw().toBuffer(), 180);
    const pixels = [[...new Array(20)].map(() => 255), ...transpose(data, 87)];
    return [...new Array(4).keys()]
        .map((i) => match(pixels.slice(i * 22, i * 22 + 18), digits))
        .join("");
};
