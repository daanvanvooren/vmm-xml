const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");
const chalk = require("chalk");
var CLI = require("clui"),
  Spinner = CLI.Spinner;
const status = new Spinner(chalk.green("Parsing csv, please hold on..."));
const saving = new Spinner(chalk.green("Saving xml, please hold on..."));

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  readFile: (filePath) => {
    status.start();
    return csv()
      .fromFile(filePath)
      .then((jsonObj) => {
        status.stop();
        console.log(chalk.green("File has been converted to JSON ✅"));
        return jsonObj;
      })
      .catch((err) => {
        status.stop();
        chalk.bgCyan(err);
        console.log(chalk.red("Converting csv to json failed."));
        process.exit();
      });
  },

  writeFile: (dir, xml) => {
    saving.start();
    fs.writeFile(dir, xml, function (err, data) {
      if (err) {
        saving.stop();
        chalk.bgCyan(err.message);
        console.log(chalk.red("Writing xml file to system failed."));
        return;
      }
      saving.stop();
      console.log(chalk.green("File has been saved to disk ✅"));
    });
  },

  fileExists: (filePath) => {
    return fs.existsSync(filePath);
  },
};
