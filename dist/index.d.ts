import { CookieJar, MemoryCookieStore } from "tough-cookie";
import nodeFetch from "node-fetch";
interface InitOptions {
    jar?: CookieJar;
    redirect?: boolean;
}
interface LoginOptions {
    username: string;
    password: string;
    url: string;
}
export declare const init: (options?: InitOptions) => {
    jar: CookieJar;
    store: MemoryCookieStore;
    fetch: typeof nodeFetch;
    login: (options: LoginOptions) => Promise<string>;
};
export {};
