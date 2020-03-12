import { URLSearchParams } from "url";
import { CookieJar, MemoryCookieStore } from "tough-cookie";
import nodeFetch from "node-fetch";
import { des } from "./des";

const withCookie = require("fetch-cookie/node-fetch");

const regex = {
  action: /action="(.*?)"/,
  lt: /LT-.*?-cas/,
  ticket: /ST-.*?-cas/
};

interface InitalOptions {
  jar?: CookieJar;
  redirect?: boolean;
}
interface LoginOptions {
  username: string;
  password: string;
  url: string;
}

export const init = (options: InitalOptions = {}) => {
  const redirect = options.redirect ?? true;
  const store = new MemoryCookieStore();
  const jar = options.jar ?? new CookieJar(store);
  const fetch = withCookie(nodeFetch, jar) as typeof nodeFetch;

  const login = async (options: LoginOptions) => {
    const { username, password, url } = options;
    let resp = await fetch(url);
    let html = await resp.text();
    const lt = (html.match(regex.lt) as string[])[0];
    const action = (html.match(regex.action) as string[])[1];
    const form = {
      ul: username.length + "",
      pl: password.length + "",
      lt,
      rsa: des(username + password + lt, "1", "2", "3"),
      execution: "e1s1",
      _eventId: "submit"
    };
    resp = await fetch(`https://pass.hust.edu.cn${action}`, {
      method: "POST",
      redirect: "manual",
      body: new URLSearchParams(form)
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
