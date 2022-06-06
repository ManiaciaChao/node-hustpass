import { URLSearchParams } from "url";
import { CookieJar, MemoryCookieStore } from "tough-cookie";
import nodeFetch from "node-fetch";
import { desEEE } from "./des.js";
import { recognize } from "./recognize.js";
import withCookie from "fetch-cookie";
const regex = {
    action: /action="(.*?)"/,
    lt: /LT-.*?-cas/,
    ticket: /ST-.*?-cas/,
};
export const init = (options = {}) => {
    var _a, _b;
    const redirect = (_a = options.redirect) !== null && _a !== void 0 ? _a : true;
    const store = new MemoryCookieStore();
    const jar = (_b = options.jar) !== null && _b !== void 0 ? _b : new CookieJar(store);
    const fetch = withCookie(nodeFetch, jar);
    const login = async (options) => {
        const { username, password, url } = options;
        let resp = await fetch(url);
        const html = await resp.text();
        const lt = html.match(regex.lt)[0];
        const action = html.match(regex.action)[1];
        let code = false;
        while (!code) {
            resp = await fetch(`https://pass.hust.edu.cn/cas/code?${Math.random()}`);
            const captcha = await resp.arrayBuffer();
            code = await recognize(captcha);
        }
        const form = {
            ul: username.length + "",
            pl: password.length + "",
            lt,
            code,
            rsa: desEEE(username + password + lt, "1", "2", "3"),
            execution: "e1s1",
            _eventId: "submit",
        };
        resp = await fetch(`https://pass.hust.edu.cn${action}`, {
            method: "POST",
            redirect: "manual",
            body: new URLSearchParams(form),
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
