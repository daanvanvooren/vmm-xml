#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const inquirer = require("inquirer");
const files = require("./lib/files");
const utils = require("./lib/data");

const questions = [
  {
    name: "report",
    type: "list",
    message: "What report are you converting?",
    choices: ["PRTO001", "PRTO002", "PRTO003", "PRTO004", "PRTO005"],
  },
  {
    name: "csv",
    type: "input",
    message: "Enter the path to the Porteau csv file:",
    default: "./data/PRTO005.csv",
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
  .then(({ csv, dir, report }) => {
    console.log(chalk.green("File has been found ✅"));
    return files.readFile(csv).then((data) => {
      switch (report) {
        case "PRTO001":
          const parsedData1 = utils.correctColumns(data);
          const missingColumns1 = utils.checkColumnsPRTO001(parsedData1[0]);
          if (missingColumns1.length > 0) {
            missingColumns1.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
            process.exit();
          }

          const tree1 = utils.buildTreePRTO001(data);
          const xml1 = utils.buildXMLPRTO001(tree1);
          files.writeFile(dir, xml1);
          break;
        case "PRTO002":
          const missingColumns2 = utils.checkColumnsPRTO002(data[0]);
          if (missingColumns2.length > 0) {
            missingColumns2.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
            process.exit();
          }

          const tree = utils.buildTreePRTO002(data);
          const xml = utils.buildXMLPRTO002(tree);
          files.writeFile(dir, xml);
          break;
        case "PRTO003":
          const parsedData3 = utils.correctColumns(data);
          const missingColumns3 = utils.checkColumnsPRTO003(parsedData3[0]);
          if (missingColumns3.length > 0) {
            missingColumns3.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
            process.exit();
          }

          const tree3 = utils.buildTreePRTO003(parsedData3);
          const xml3 = utils.buildXMLPRTO003(tree3);
          files.writeFile(dir, xml3);
          break;
        case "PRTO004":
          const parsedData4 = utils.correctColumns(data);
          const missingColumns4 = utils.checkColumnsPRTO004(parsedData4[0]);
          if (missingColumns4.length > 0) {
            missingColumns4.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
            process.exit();
          }

          const tree4 = utils.buildTreePRTO004(parsedData4);
          const xml4 = utils.buildXMLPRTO004(tree4);
          files.writeFile(dir, xml4);
          break;
        case "PRTO005":
          const parsedData5 = utils.correctColumns(data);
          const missingColumns5 = utils.checkColumnsPRTO005(parsedData5[0]);
          if (missingColumns5.length > 0) {
            missingColumns5.forEach((c) => console.log(chalk.red(`Missing column: ${c} \n`)));
            process.exit();
          }

          const tree5 = utils.buildTreePRTO005(parsedData5);
          const xml5 = utils.buildXMLPRTO005(tree5);
          files.writeFile(dir, xml5);
          break;
        default:
          console.log(chalk.red(`No valid report selected`));
          process.exit();
      }
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
