import { URLSearchParams } from "url";
import { CookieJar, MemoryCookieStore } from "tough-cookie";
import nodeFetch from "node-fetch";
import { des } from "./des";
import { readCaptcha } from "./captcha";

const withCookie = require("fetch-cookie/node-fetch");

const regex = {
  action: /action="(.*?)"/,
  lt: /LT-.*?-cas/,
  ticket: /ST-.*?-cas/,
};

interface InitOptions {
  jar?: CookieJar;
  redirect?: boolean;
}
interface LoginOptions {
  username: string;
  password: string;
  url: string;
}

export const init = (options: InitOptions = {}) => {
  const redirect = options.redirect ?? true;
  const store = new MemoryCookieStore();
  const jar = options.jar ?? new CookieJar(store);
  const fetch = withCookie(nodeFetch, jar) as typeof nodeFetch;

  const login = async (options: LoginOptions) => {
    const { username, password, url } = options;
    let resp = await fetch(url);
    const html = await resp.text();
    const lt = (html.match(regex.lt) as string[])[0];
    const action = (html.match(regex.action) as string[])[1];
    let code: boolean | string = false;
    while (!code) {
      resp = await fetch(`https://pass.hust.edu.cn/cas/code?${Math.random()}`);
      const captcha = await resp.buffer();
      code = await readCaptcha(captcha);
    }
    const form = {
      ul: username.length + "",
      pl: password.length + "",
      lt,
      code,
      rsa: des(username + password + lt, "1", "2", "3"),
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
