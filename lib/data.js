const chalk = require("chalk");
const xmlbuilder = require("xmlbuilder");
var CLI = require("clui"),
  Spinner = CLI.Spinner;
const status = new Spinner(chalk.green("Parsing csv, please hold on..."));
const statusJson = new Spinner(chalk.green("Parsing JSON, please hold on..."));
const statusXml = new Spinner(chalk.green("Creating XML, please hold on..."));

const peilmeting = (row) => ({
  datum: row["Peil Opname Datum / Volume Opname Datum Start"],
  opmeter: row.Opmeter,
  diepte_meetpt: row.Peilmeting,
  filtertoestand_code: row["Filtertoestand Code"],
  methode_peilmeting: row["Peilmeting Methode"],
  status_code: row["Status Code"],
  zoet: row.Zoet,
  betrouwbaarheid: row.Betrouwb,
  volume1h: row["Ogenblikkelijk Debiet (Volume 1h)"],
  project: row["Project IMJV"],
});

module.exports = {
  checkColumns: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Peilmeting")) missingColumns.push("Peilmeting");
    if (!row.hasOwnProperty("Directie Naam")) missingColumns.push("Directie Naam");
    if (!row.hasOwnProperty("Opgepompte Volume Voor Stilstand (Volume 8h)"))
      missingColumns.push("Opgepompte Volume Voor Stilstand (Volume 8h)");
    if (!row.hasOwnProperty("Aantal Uur Voor Stilstand")) missingColumns.push("Aantal Uur Voor Stilstand");
    if (!row.hasOwnProperty("Ogenblikkelijk Debiet (Volume 1h)"))
      missingColumns.push("Ogenblikkelijk Debiet (Volume 1h)");
    if (!row.hasOwnProperty("Opmeter")) missingColumns.push("Opmeter");
    if (!row.hasOwnProperty("Filtertoestand Code")) missingColumns.push("Filtertoestand Code");
    if (!row.hasOwnProperty("Peilmeting Methode")) missingColumns.push("Peilmeting Methode");
    if (!row.hasOwnProperty("Meetpunt Nummer VMM")) missingColumns.push("Meetpunt Nummer VMM");
    if (!row.hasOwnProperty("Project IMJV")) missingColumns.push("Project IMJV");
    if (!row.hasOwnProperty("Peil Opname Datum / Volume Opname Datum Start"))
      missingColumns.push("Peil Opname Datum / Volume Opname Datum Start");
    if (!row.hasOwnProperty("Betrouwb")) missingColumns.push("Betrouwb");
    if (!row.hasOwnProperty("Put Type")) missingColumns.push("Put Type");
    if (!row.hasOwnProperty("Zoet")) missingColumns.push("Zoet");
    if (!row.hasOwnProperty("Status Code")) missingColumns.push("Status Code");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Filter Nummer")) missingColumns.push("Filter Nummer");
    if (!row.hasOwnProperty("Opmerking")) missingColumns.push("Opmerking");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetpunt Nummer")) missingColumns.push("Meetpunt Nummer");

    return missingColumns;
  },

  parseJson: (data) => {
    try {
      status.start();
      const j = JSON.parse(data);
      chalk.green("File has been parsed to a javascript object ✅");
      return j;
    } catch (err) {
      console.log(chalk.red("Failed to JSON.parse the csv data: " + err));
      process.exit();
    } finally {
      status.stop();
    }
  },

  buildTree: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Meetpunt Nummer"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_nummer: cv["Filter Type"],
            filter_type: cv["Filter Nummer"],
            meetnet: cv.Meetnet,
            peilmetingen: [peilmeting(cv)],
          };
        } else {
          acc[putid].peilmetingen.push(peilmeting(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildXML: (data) => {
    statusXml.start();
    const elements = data.map((item) => {
      if (!item) return {};

      const peilmetingen = item?.peilmetingen.map((meting) => {
        if (!meting) return {};
        return {
          "@datum": meting.datum,
          "@opmeter": meting.opmeter,
          "@diepte_meetpt": meting.diepte_meetpt,
          "@filtertoestand_code": meting.filtertoestand_code,
          "@methode_peilmeting": meting.methode_peilmeting,
          "@status_code": meting.status_code,
          "@zoet": meting.zoet,
          "@betrouwbaarheid": meting.betrouwbaarheid,
          "@volume1h": meting.volume1h,
          "@project": meting.project,
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_type,
            "@filter_type": "TBD",
            "@meetnet": item.meetnet,
          },
        },
      };

      const filter_nummer = item.filter_nummer.match(/filter/gi) ? item.filter_nummer : null;
      if (filter_nummer) ele.put.filter[filter_nummer] = {};

      ele.put.filter.peilmeting = peilmetingen;

      return ele;
    });

    const xml = {
      "dov:dov-import": {
        "@class": "DawAccess",
        "@type": "putten",
        "@version": "1.0",
        "@xmlns:dov": "http://schema.dov.vlaanderen.be",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:schemaLocation": "http://schema.dov.vlaanderen.be c:DOV_XMLDOVschema.xsd",
        xyz: elements,
      },
    };

    statusXml.stop();
    console.log(chalk.green("XML has been build ✅"));
    return xmlbuilder.create(xml).end({ pretty: true });
  },
};
