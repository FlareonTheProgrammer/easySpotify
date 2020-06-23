const flogger = require("flogger");
flogger.setLogDir("./logs");
const fs = require("fs");
const inquirer = require("inquirer");
const { cData, authCheck } = require("./src/main.js");

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
    name: "proceed",
    message: "A json.sqlite file was found inside your project's root folder. Are you sure you want to overwrite it?",
    choices: ["Yes", "No"],
  }
];

(async function () {
  const beginSetup = await inquirer.prompt(setup);

  if (beginSetup.proceed === "Yes") {
    flogger.log("Beginning setup of easySpotify...");

    var chkInt = 0; // Initialize the check integer

    const resp = await inquirer.prompt(clientInfo);
    await cData.set("id", resp.id);
    await cData.set("secret", resp.secret);
    flogger.log("Client data file created. Checking validity of credentials...");
    await authCheck();
    flogger.log("Credentials validated! Enjoy using easySpotify, we'll take care of token renewal behind the scenes.");

    // Checks if a db file exists in easySpotify's project folder
    if (fs.existsSync(`./json.sqlite`)) {
      chkInt = chkInt + 1;
    };

    // Checks if a db file exists in the parent of the parent folder
    if (fs.existsSync("../../json.sqlite")) {
      chkInt = chkInt + 2;
    };

    // Checks if easySpotify exists inside of a node_modules folder
    if (fs.existsSync(`../../node_modules`)) {
      chkInt = chkInt + 4;
    };

    if (chkInt % 2 === 0) {
      flogger.error("This is a bit of a problem." +
        "The json.sqlite file wasn't found in easySpotify's module folder.");
      throw ("Unable to recover from extraneous error.")
    }

    switch (chkInt) {
      case 1:
        flogger.log("A json.sqlite file was not found in the parent folder of the parent folder of easySpotify" +
          " however, easySpotify is not located in a node_modules folder, so the file will not be moved.");
        break;
      case 3:
        flogger.warn(
          "A json.sqlite file was found in the parent folder of the parent folder of easySpotify. " +
          "However, easySpotify is not located in a node_modules folder, so the file will not be moved, " +
          "and a prompt to overwrite it will not be shown."
        );
        break;
      case 5:
        flogger.log("Conditions to automatically finalize setup have been met. Moving file...");
        try {
          fs.renameSync("./json.sqlite", "../../json.sqlite");
          flogger.log("Successfully moved json.sqlite to project root folder.");
        } catch (err) {
          flogger.error(`Failed to move json.sqlite. Reason: ${err}`);
        }
        break;
      case 7:
        flogger.warn("A json.sqlite file was found in the project folder. Prompting user for confirmation.")
        let overwrite = await inquirer.prompt(confirmOverwrite)
        if (overwrite === "Yes") {
          try {
            fs.unlinkSync("../../json.sqlite");
            fs.renameSync("./json.sqlite", "../../json.sqlite");
            flogger.log("Successfully overwrote json.sqlite in project root folder.");
          } catch (err) {
            flogger.error(`Failed to move json.sqlite. Reason: ${err}`);
          }
        }
        else if (overwrite === "No") {
          flogger.log("User asked not to overwrite file, no more can be done.");
        }
        break;
    }
  } else if (beginSetup.proceed === "No") {
    return console.log(
      "Got it. You'll eventually have to do this in order for easySpotify to work."
    );
  }
  return;
})();
