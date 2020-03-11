import { URLSearchParams } from "url";
import { CookieJar } from "tough-cookie";
import nodeFetch from "node-fetch";
import { des } from "./des";

const regex = {
  action: /action="(.*?)"/,
  lt: /LT-.*?-cas/,
  ticket: /ST-.*?-cas/
};

export interface Options {
  username: string;
  password: string;
  url: string;
  jar?: CookieJar;
}

export const login = async (options: Options) => {
  const { username, password, url } = options;
  const jar = options.jar ?? new CookieJar();
  const fetch = require("fetch-cookie")(nodeFetch, jar) as typeof nodeFetch;

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

  return {
    ticket,
    jar,
    fetch
  };
};
