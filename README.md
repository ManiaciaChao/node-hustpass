<h1 align="center">Welcome to node-hustpass 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/node-hustpass" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/node-hustpass.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> HUSTPass auth library for Node.js. Node.js 华科统一身份认证库。

## Requirement

From April 30, 2020, HUSTPass requires users to input captcha when authenticating. In order to automatically recognize captcha, additional dependencies need to be installed in your devices. They are:

* `ImageMagick`, you can get it from your package manager or download manually from its [offcial website](https://imagemagick.org/script/download.php).
* `Tesseract` training data, it will be downloaded automatically the first time you run. You may need to use a proxy.

## Install

```sh
yarn add node-hustpass
```

## Usage

```javascript
const { init } = require("node-hustpass");

(async () => {
  const { fetch, jar, login } = await init();

  await login({
    username: "U201X12345",
    password: "QZBSQZZH",
    url:
      "https://pass.hust.edu.cn/cas/login?service=http%3A%2F%2Fhubs.hust.edu.cn%2Fhustpass.action"
  });
  /**
   * do something cool here!
   * you can simply use this `fetch` method,
   * or pass `jar` into your own request library.
   */
})();
```

## Author

👤 **maniacata**


## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_