#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const inquirer = require("inquirer");
const files = require("./lib/files");
const utils = require("./lib/data");

const questions = [
  {
    name: "csv",
    type: "input",
    message: "Enter the path to the Porteau csv file:",
    default: "./data/csv.csv",
    validate: function (value) {
      if (value.slice(-3) !== "csv") return chalk.red("Search for a valid csv file!");
      if (files.fileExists(value)) {
        return true;
      } else {
        return chalk.red("Cannot find file!");
      }
    },
  },
  {
    name: "dir",
    type: "input",
    message: "Enter the directory where you would like to save the output XML:",
    default: "./data/xml.xml",
  },
];

clear();

console.log(chalk.yellow(figlet.textSync("VMM XML generator", { horizontalLayout: "full" })));
console.log("\n");

inquirer
  .prompt(questions)
  .then(({ csv, dir }) => {
    console.log(chalk.green("File has been found ✅"));
    return files.readFile(csv).then((data) => {
      const missingColumns = utils.checkColumns(data[0]);
      if (missingColumns.length > 0) {
        missingColumns.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
        process.exit();
      }

      const tree = utils.buildTree(data);
      const xml = utils.buildXML(tree);
      files.writeFile(dir, xml);
    });
  })
  .catch((error) => {
    if (error.isTtyError) {
      chalk.red("Prompt couldn't be rendered in the current environment!");
    } else {
      chalk.bgCyan(error);
      chalk.red("Something went wrong!");
    }
  });
