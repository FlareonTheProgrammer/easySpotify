const { spotifyReq } = require("../src/main");

const flogger = require("flogger");
flogger.setLogDir(`${__dirname}/logs`);

spotify = new spotifyReq();

(async function () {
  flogger.log("v0.1.0 Request")
  flogger.log(
    `userData: ${JSON.stringify(await spotify.get("v1/search").data({ q: "TWRP", type: "artist" }))}`
  );
  /*
  console.log("\n\x1b[37m-------------------------------------------------------\x1b[0m\n");
  console.log("\x1b[36m\x1b[1m[ Beta Request ]");
  console.log(
    `\x1b[36m\x1b[1muserDataBeta\x1b[37m: \x1b[0m${JSON.stringify(await beta.get(gme.users).data({ login: "chefbear" }))}`, "\n"
  );
  */
}());