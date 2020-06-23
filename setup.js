const flogger = require("flogger");
const fs = require("fs");
const inquirer = require("inquirer");
const { cData } = require("./src/main.js");

let setup = [
  {
    type: "list",
    name: "proceed",
    message: "Would you like to set up easySpotify at this time?",
    choices: ["Yes", "No"],
  },
];
let clientInfo = [
  {
    type: "input",
    name: "id",
    message: "Please enter the client id of your Spotify application.",
  },
  {
    type: "input",
    name: "secret",
    message: "Please enter the client secret of your Spotify application.",
  },
];
let confirmOverwrite = [
  {
    type: "list",
    name: "overwriteCheck",
    message: "A json.sqlite file was found inside your project's root folder. Are you sure you want to overwrite it?",
    choices: ["Yes", "No"],
  }
];
(async function () {
  const beginSetup = await inquirer.prompt(setup);
  if (beginSetup.proceed === "Yes") {
    flogger.log("Beginning setup of easySpotify...");

    var chkInt = 0; // Initialize the check integer

    // Checks if a db file exists in easySpotify's project folder
    if (fs.existsSync(`./json.sqlite`)) {
      chkInt = chkInt + 1;
    };

    // Checks if a db file exists in the parent of the parent folder
    if (fs.existsSync("../../json.sqlite")) {
      chkInt = chkInt + 2;
    };

    // Checks if easySpotify exists inside of a node_modules folder
    if (fs.existsSync("../../node_modules")) {
      chkInt = chkInt + 4;
    };
    chkInt = (new Number(chkInt));
    console.log(chkInt & 7);

    switch (chkBin) {
      case 0:
        return flogger.error(
          "This is a bit of a problem. The json.sqlite file wasn't found in easySpotify's project folder."
        )
    };
    const resp = await inquirer.prompt(clientInfo);
    cData.set("id", resp.id);
    cData.set("secret", resp.secret);
    flogger.log("Client data file created.");
    if (fs.existsSync(`./json.sqlite`) && !fs.existsSync("../../json.sqlite") && fs.existsSync("../../node_modules")) {
      flogger.log(
        "json.sqlite file found in easyspotify module folder, attempting to move it..."
      );
      try {
        fs.renameSync("./json.sqlite", "../../json.sqlite");
        return console.log(
          "[SUCCESS] Moved json.sqlite to project root folder."
        );
      } catch (err) {
        console.error(
          "[ERROR] \x1b[33mFailed to move json.sqlite. Reason:\x1b[0m",
          err
        );
      }
    } else if (
      fs.existsSync("./json.sqlite") &&
      fs.existsSync("../../json.sqlite")
    ) {
      return console.warn(
        "[WARN] \x1b[33mjson.sqlite file found in (what is assumed to be) the root folder, refusing to overwrite it due to potential for data loss.\x1b[0m"
      );
    } else if (fs.existsSync("../../node_modules")) {
      return console.log("easySpotify does not seem to be installed in a node_modules folder. Returning...")
    } else {
      return console.warn("[WARN]\x1b[33m No json.sqlite file found.\x1b[0m");
    }
  } else if (beginSetup.proceed === "No") {
    return console.log(
      "Got it. You'll eventually have to do this in order for easySpotify to work."
    );
  }
  return;
})();
