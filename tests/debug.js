const { stableReq, gme } = require("../src/main");
stable = new stableReq();
(async function () {
  console.log("\n\x1b[36m\x1b[1m[ v0.1.0 Request ]\x1b[0m")
  console.log(
    `\x1b[36m\x1b[1muserData\x1b[37m: \x1b[0m${JSON.stringify(await stable.get(gme.users).data({ login: "chefbear" }))}`
  );
  /*
  console.log("\n\x1b[37m-------------------------------------------------------\x1b[0m\n");
  console.log("\x1b[36m\x1b[1m[ Beta Request ]");
  console.log(
    `\x1b[36m\x1b[1muserDataBeta\x1b[37m: \x1b[0m${JSON.stringify(await beta.get(gme.users).data({ login: "chefbear" }))}`, "\n"
  );
  */
}());