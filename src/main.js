"use strict"
const unirest = require("unirest");
const db = require("quick.db");
const btoa = require('btoa');
const flogger = require("flogger");

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
        flogger.custom(
          "TOKEN", "lGreen",
          "SUCCESS: Got token from Spotify and stored it in the database."
        );
      }
    })
    .catch((err) => {
      if (err instanceof AuthError) {
        flogger.error(err);
        throw (err);
      }
      else {
        flogger.error(err);
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
      flogger.custom(
        "AUTH", "yellow",
        "No token found in database. Requesting one from Spotify..."
      );
      await getNewToken();
      return;
    }
    const resp = await unirest
      .get(`${baseURL}/v1/browse/categories`)
      .headers({
        Authorization: auth,
        "Client-ID": clientID,
      })
      .send();
    // Okay so here's where this ugly piece of code that checks for and hopefully handles recursion
    process.env.recursionCheck = new Number(process.env.recursionCheck) + 1;
    if (process.env.recursionCheck > 1) {
      return flogger.custom(
        `RE:CURSE (${process.env.recursionCheck})`, "red", "Recursion detected. Attempting to exit loop... If successful, there will be no further output from RE:CURSE."
      );
    }
    process.env.recursionDoubleCheck =
      new Number(process.env.recursionDoubleCheck) + 1;
    if (process.env.recursionDoubleCheck > 1) {
      return flogger.custom(
        `RE:CURSE (${process.env.recursionCheck})`, "red",
        "Loop exit was unsuccessful. In the future, this will result in an an exception being thrown."
      );
    }
    // End of this disgusting code

    flogger.info(`Spotify server responded with code: ${resp.code}`);
    if (resp.code == 401) {
      flogger.custom(
        "AUTH", "yellow",
        "Authentication failed. Requesting new token from Spotify..."
      );
      await getNewToken();
      return;
    } else {
      flogger.custom(
        "AUTH", "lGreen",
        "Authentication successful. No need to request new token."
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
    await unirest[this.method](`${baseURL}/${this.resource}`)
      .headers({
        Authorization: auth
      })
      .query(queryObject)
      .send()
      .then((response) => {
        flogger.custom(
          "MagicRq", "blue",
          "Response received."
        );
        resp = response.body;
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
exports.spotifyReq = MagicRq;
