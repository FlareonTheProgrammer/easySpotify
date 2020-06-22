const unirest = require("unirest");
const db = require("quick.db");

const cData = new db.table("cData");
const baseURL = "https://api.spotify.com";

exports.cData = cData;

/**
 * Custom Authentication Error Class
 *
 * @type {AuthError}
 */
class AuthError extends Error {
  constructor(msg, statCode, details, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }

    this.name = "AuthError";
    this.msg = String(msg);
    this.statCode = Number(statCode);
    this.details = String(details);
  }
}

const clientID = cData.get("id");

/**
 * Token Getter Function
 *
 *  If request for token is denied, throw custom auth error
 *
 * @type {Function}
 */
async function getNewToken() {
  await unirest
    .post("https://accounts.spotify.com/api/token")
    .headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientID}:${cData.get("secret")}`)}`
    })
    .send({
      grant_type: "client_credentials",
    })
    .then(async (response) => {
      if (response.status != 200) {
        throw new AuthError(
          "Authentication failed!",
          response.status,
          response.raw_body
        );
      } else {
        await cData.delete("token");
        await cData.set("token", response.body.access_token);
        auth = `Bearer ${cData.get("token")}`;
        console.log(
          "[ NEW_TOKEN ] \x1b[32mSUCCESS: Got token from Spotify and stored it in the database\x1b[0m"
        );
      }
    })
    .catch((err) => {
      if (err instanceof AuthError) {
        console.error(err);
        throw (err);
      }
      else {
        console.error(err);
      };
    })
};

/**
 * Authentication Header Value
 *
 * This is a very useful value to have on hand, it saves a lot of typing later on.
 *
 * @type {string}
 */
let auth = `Bearer ${cData.get("token")}`;

/**
 * Check Authorization before carrying out any requests
 *
 * If auth fails, ask Spotify for new token by calling newToken();
 *
 * @type {Function}
 */
async function checkAuth() {
  process.env.recursionCheck = 0; // Recursion check
  process.env.recursionDoubleCheck = 0; // Second recursion check

  try {
    if (cData.get("token") === undefined) {
      console.warn(
        "\x1b[37m[\x1b[33m Auth \x1b[37m]\x1b[33mNo token found in database. \x1b[37m- \x1b[0mRequesting one from Spotify..."
      );
      await getNewToken();
      return;
    }
    const resp = await unirest
      .get(`${helixAPI}/users?id=4`)
      .headers({
        Authorization: auth,
        "Client-ID": clientID,
      })
      .send();
    // Okay so here's where this ugly piece of code that checks for and hopefully handles recursion
    process.env.recursionCheck = new Number(process.env.recursionCheck) + 1;
    if (process.env.recursionCheck > 1) {
      return console.warn(
        `\x1b[31m[ RE:CURSE ]\x1b[91m[${process.env.recursionCheck}]\x1b[31m Recursion detected. Attempting to exit loop... If successful, there will be no further output from RE:CURSE.\x1b[0m`
      );
    }
    process.env.recursionDoubleCheck =
      new Number(process.env.recursionDoubleCheck) + 1;
    if (process.env.recursionDoubleCheck > 1) {
      return console.warn(
        `\x1b[31m[ RE:CURSE ]\x1b[91m[${process.env.recursionCheck}]\x1b[31m Loop exit was unsuccessful. In the future, this \x1b[4mwill\x1b[0;31m result in an an exception being thrown.\x1b[0m`
      );
    }
    // End of this disgusting code

    console.log(`Spotify server responded with code: ${resp.code}`);
    if (resp.code == 401) {
      console.warn(
        "\x1b[37m[\x1b[33m Auth \x1b[37m]\x1b[33m Authentication failed. \x1b[37m- \x1b[0mRequesting new token from Spotify..."
      );
      await getNewToken();
      return;
    } else {
      console.log(
        "\x1b[32mAuthentication successful. \x1b[37m- \x1b[0mNo need to request new token."
      );
      return;
    }
  } catch (err) {
    throw err;
  }
}
// End of Auth Check

//* v0.1.0 (previously BETA)

const { gme } = require("./res/get-endpoints");
// Export gme
exports.gme = gme;

/**
 * MagicRq
 * * Also known as the thing that makes this work
 *
 * @type {MagicRq}
 */
class MagicRq {
  //* GET REQUESTS
  get = (rsrc) => {
    this.method = "get";
    if (JSON.stringify(gme).includes(rsrc)) {
      this.resource = rsrc;
    } else {
      throw `"${rsrc}" isn't a valid resource or resource alias.`;
    }
    return this;
  };

  //* POST REQUESTS

  //* DATA FOR Spotify TO PROCESS
  data = async (queryObject) => {
    let resp;
    await checkAuth();
    await unirest[this.method](`${helixAPI}/${this.resource}`)
      .headers({
        Authorization: auth,
        "Client-ID": clientID,
      })
      .query(queryObject)
      .send()
      .then((response) => {
        console.log(
          "\x1b[1m\x1b[37m",
          "[" + "\x1b[34m",
          "MagicRq",
          "\x1b[37m" + "]",
          "\x1b[0m\x1b[34m",
          "Response received.\x1b[0m"
        );
        resp = response.body.data[0];
      });
    return resp;
  };
  // End of MagicRq Class
}

/**
 * v0.1.0 Exports
 *
 * @type {any}
 */
exports.stableReq = MagicRq;
