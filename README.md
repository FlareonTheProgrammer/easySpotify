# EasyTTV

## Making the Twitch API easier to use

---

Current version: v0.1.2

### Installation

```bash
$ npm install --save FlareonTheProgrammer/easyspotify
```

Setup should begin after install. Follow the prompts to set up easyspotify for use with the Spotify API.

### To use in your code

```javascript
const { stableReq, gme } = require("easyspotify");
espot = new stableReq();

console.log(await espot.get(gme.user).data({ login: "chefbear" }));
```

For more information, check out the gme file at ./node_modules/easyspotify/src/res/get-endpoints.js
