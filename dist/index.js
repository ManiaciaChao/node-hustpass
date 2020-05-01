"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const tough_cookie_1 = require("tough-cookie");
const node_fetch_1 = require("node-fetch");
const des_1 = require("./des");
const captcha_1 = require("./captcha");
const withCookie = require("fetch-cookie/node-fetch");
const regex = {
    action: /action="(.*?)"/,
    lt: /LT-.*?-cas/,
    ticket: /ST-.*?-cas/,
};
exports.init = (options = {}) => {
    var _a, _b;
    const redirect = (_a = options.redirect) !== null && _a !== void 0 ? _a : true;
    const store = new tough_cookie_1.MemoryCookieStore();
    const jar = (_b = options.jar) !== null && _b !== void 0 ? _b : new tough_cookie_1.CookieJar(store);
    const fetch = withCookie(node_fetch_1.default, jar);
    const login = async (options) => {
        const { username, password, url } = options;
        let resp = await fetch(url);
        const html = await resp.text();
        const lt = html.match(regex.lt)[0];
        const action = html.match(regex.action)[1];
        let code = false;
        while (!code) {
            resp = await fetch(`https://pass.hust.edu.cn/cas/code?${Math.random()}`);
            const captcha = await resp.buffer();
            code = await captcha_1.readCaptcha(captcha);
        }
        const form = {
            ul: username.length + "",
            pl: password.length + "",
            lt,
            code,
            rsa: des_1.des(username + password + lt, "1", "2", "3"),
            execution: "e1s1",
            _eventId: "submit",
        };
        resp = await fetch(`https://pass.hust.edu.cn${action}`, {
            method: "POST",
            redirect: "manual",
            body: new url_1.URLSearchParams(form),
        });
        const ticket = resp.headers.get("location");
        if (!ticket) {
            throw Error("Login failed!");
        }
        if (redirect) {
            await fetch(ticket);
        }
        return ticket;
    };
    return { jar, store, fetch, login };
};
