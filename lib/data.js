const { black } = require("chalk");
const chalk = require("chalk");
const xmlbuilder = require("xmlbuilder");
var CLI = require("clui"),
  Spinner = CLI.Spinner;
const status = new Spinner(chalk.green("Parsing csv, please hold on..."));
const statusJson = new Spinner(chalk.green("Parsing JSON, please hold on..."));
const statusXml = new Spinner(chalk.green("Creating XML, please hold on..."));

const peilmeting01 = (row) => ({
  datum: row["Datum"],
  opmeter: row.Opmeter,
  periode_pompenstil: row["Aantal uren voor stilstand"] ? `${row["Aantal uren voor stilstand"]}:00` : "",
  volume1h: row["Debiet"],
  volume8h: row["Opgepompt volume voor stilstand"],
  project: row["Project IMJV Vlag"],
});

const peilmeting02 = (row) => ({
  datum: `${row["Datum"]}T${row["Opname Uur"]}`,
  opmeter: row.Opmeter,
  diepte_meetpt: row["Peilmeting (Diepte Meetpt)"],
  filtertoestand_code: row["Filtertoestand Code"],
  methode_peilmeting: row["Peilmeting Methode"],
  status_code: row["Status Code"],
  zoet: row.Zoet,
  betrouwbaarheid: row.Betrouwb,
  volume1h: row["Ogenblikkelijk Debiet (Volume 1h)"],
  project: row["Project IMJV"],
});

const onttrekking = (row) => ({
  begin: row["Opname Datum Start"],
  einde: row["Opname Datum Einde"],
  volume: row["Opgepompte Volume"],
  project: "IMJV",
  betrouwb: row.Betrouwb,
});

const onttrekking4 = (row) => ({
  begin: row["Opname Datum Start"],
  einde: row["Opname Datum Einde"],
  volume: row["Opgepompte Volume"],
  project: "IMJV",
  betrouwb: row.Betrouwb,
});

module.exports = {
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

  correctColumns: (data) => {
    const columns = [];
    let foundAccount = false;
    Object.keys(data[0]).forEach((key) => {
      if (foundAccount) return columns.push(key);
      if (key === "Account") {
        foundAccount = true;
        return columns.push(data[0][key]);
      }
      return columns.push(data[0][key]);
    });

    const data_without_first_row = data.slice(1);
    return data_without_first_row.map((row) => {
      const new_row = {};

      Object.keys(row).forEach((key, index) => {
        const value = row[key];
        const column = columns[index];

        new_row[column] = value;
      });

      return new_row;
    });
  },

  checkColumnsPRTO001: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Put Code")) missingColumns.push("Put Code");
    if (!row.hasOwnProperty("Filter Nummer")) missingColumns.push("Filter Nummer");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Datum")) missingColumns.push("Datum");
    if (!row.hasOwnProperty("Opmeter")) missingColumns.push("Opmeter");
    if (!row.hasOwnProperty("Project IMJV Vlag")) missingColumns.push("Project IMJV Vlag");
    if (!row.hasOwnProperty("Debiet")) missingColumns.push("Debiet");
    if (!row.hasOwnProperty("Opgepompt volume voor stilstand")) missingColumns.push("Opgepompt volume voor stilstand");
    if (!row.hasOwnProperty("Aantal uren voor stilstand")) missingColumns.push("Aantal uren voor stilstand");

    return missingColumns;
  },

  checkColumnsPRTO002: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Peilmeting (Diepte Meetpt)")) missingColumns.push("Peilmeting");
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
    if (!row.hasOwnProperty("Datum")) missingColumns.push("Datum");
    if (!row.hasOwnProperty("Betrouwb")) missingColumns.push("Betrouwb");
    if (!row.hasOwnProperty("Zoet")) missingColumns.push("Zoet");
    if (!row.hasOwnProperty("Status Code")) missingColumns.push("Status Code");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Opmerking")) missingColumns.push("Opmerking");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetpunt Nummer")) missingColumns.push("Meetpunt Nummer");

    return missingColumns;
  },

  checkColumnsPRTO003: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Put Code")) missingColumns.push("Put Code");
    if (!row.hasOwnProperty("Put Type")) missingColumns.push("Put Type");
    if (!row.hasOwnProperty("Filter Nummer")) missingColumns.push("Filter Nummer");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Opname Datum Start")) missingColumns.push("Opname Datum Start");
    if (!row.hasOwnProperty("Opname Datum Einde")) missingColumns.push("Opname Datum Einde");
    if (!row.hasOwnProperty("Opgepompte Volume")) missingColumns.push("Opgepompte Volume");
    if (!row.hasOwnProperty("Debietmeter Merk")) missingColumns.push("Debietmeter Merk");
    if (!row.hasOwnProperty("Debietmeter Type")) missingColumns.push("Debietmeter Type");
    if (!row.hasOwnProperty("Debietmeter Nummer")) missingColumns.push("Debietmeter Nummer");
    if (!row.hasOwnProperty("Betrouwb")) missingColumns.push("Betrouwb");
    if (!row.hasOwnProperty("Datum laatste ijking")) missingColumns.push("Datum laatste ijking");

    return missingColumns;
  },

  checkColumnsPRTO004: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Installatiecode")) missingColumns.push("Installatiecode");
    if (!row.hasOwnProperty("Project IMJV")) missingColumns.push("Project IMJV");
    if (!row.hasOwnProperty("Filter Nummer")) missingColumns.push("Filter Nummer");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Opname Datum Start")) missingColumns.push("Opname Datum Start");
    if (!row.hasOwnProperty("Opname Datum Einde")) missingColumns.push("Opname Datum Einde");
    if (!row.hasOwnProperty("Volume")) missingColumns.push("Volume");
    if (!row.hasOwnProperty("Betrouwb")) missingColumns.push("Betrouwb");

    return missingColumns;
  },

  checkColumnsPRTO005: (row) => {
    const missingColumns = [];

    if (!row.hasOwnProperty("Put Code")) missingColumns.push("Put Code");
    if (!row.hasOwnProperty("Meetpunt Nummer VMM")) missingColumns.push("Meetpunt Nummer VMM");
    if (!row.hasOwnProperty("Project IMJV")) missingColumns.push("Project IMJV");
    if (!row.hasOwnProperty("Filter Type")) missingColumns.push("Filter Type");
    if (!row.hasOwnProperty("Meetnet")) missingColumns.push("Meetnet");
    if (!row.hasOwnProperty("Opname Datum Start")) missingColumns.push("Opname Datum Start");
    if (!row.hasOwnProperty("Opname Datum Einde")) missingColumns.push("Opname Datum Einde");
    if (!row.hasOwnProperty("Opgepompte Volume")) missingColumns.push("Opgepompte Volume");
    if (!row.hasOwnProperty("Debietmeter Merk")) missingColumns.push("Debietmeter Merk");
    if (!row.hasOwnProperty("Debietmeter Nummer")) missingColumns.push("Debietmeter Nummer");
    if (!row.hasOwnProperty("Betrouwb")) missingColumns.push("Betrouwb");
    if (!row.hasOwnProperty("Datum laatste ijking")) missingColumns.push("Datum laatste ijking");

    return missingColumns;
  },

  buildTreePRTO001: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Put Code"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_type: cv["Filter Type"],
            filter_nummer: cv["Filter Nummer"],
            meetnet: cv.Meetnet,
            peilmetingen: [peilmeting01(cv)],
          };
        } else {
          acc[putid].peilmetingen.push(peilmeting01(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildTreePRTO002: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Meetpunt Nummer"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_nummer: cv["Meetpunt Nummer VMM"],
            filter_type: cv["Filter Type"],
            meetnet: cv.Meetnet,
            peilmetingen: [peilmeting02(cv)],
          };
        } else {
          acc[putid].peilmetingen.push(peilmeting02(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildTreePRTO003: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Put Code"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_type: cv["Filter Type"],
            filter_nummer: cv["Filter Nummer"],
            meetnet: cv.Meetnet,
            debietmeter_serienummer: cv["Debietmeter Nummer"],
            debietmeter_merk: `${cv["Debietmeter Merk"]}-${cv["Debietmeter Type"]}`,
            debietmeter_laatste_ijking: cv["Datum laatste ijking"],
            ontrekkingen: [onttrekking(cv)],
          };
        } else {
          acc[putid].ontrekkingen.push(onttrekking(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildTreePRTO004: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Installatiecode"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_type: cv["Filter Type"],
            filter_nummer: cv["Filter Nummer"],
            meetnet: cv.Meetnet,
            ontrekkingen: [onttrekking4(cv)],
          };
        } else {
          acc[putid].ontrekkingen.push(onttrekking4(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildTreePRTO005: (data) => {
    statusJson.start();
    const parsed = Object.values(
      data.reduce((acc, cv) => {
        const putid = cv["Put Code"];
        if (!acc[putid]) {
          acc[putid] = {
            put_nummer: putid,
            filter_type: cv["Filter Type"],
            filter_nummer: cv["Meetpunt Nummer VMM"],
            meetnet: cv.Meetnet,
            debietmeter_serienummer: cv["Debietmeter Nummer"],
            debietmeter_merk: cv["Debietmeter Merk"],
            debietmeter_laatste_ijking: cv["Datum laatste ijking"],
            ontrekkingen: [onttrekking4(cv)],
          };
        } else {
          acc[putid].ontrekkingen.push(onttrekking4(cv));
        }
        return acc;
      }, {})
    );
    statusJson.stop();
    console.log(chalk.green("Object tree build ✅"));
    return parsed;
  },

  buildXMLPRTO001: (data) => {
    statusXml.start();
    const elements = data.map((item) => {
      if (!item) return {};

      const peilmetingen = item?.peilmetingen.map((meting) => {
        if (!meting) return {};
        return {
          "@datum": meting.datum,
          "@opmeter": meting.opmeter,
          ...(meting.volume1h && { "@volume1h": meting.volume1h }),
          ...(meting.periode_pompenstil === "24:00" ? { "@volume8h": meting.volume8h } : {}),
          "@project": meting.project,
          ...(!meting.volume1h && { "@periode_pompenstil": meting.periode_pompenstil }),
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_nummer,
            "@filter_type": item.filter_type,
            "@meetnet": item.meetnet,
          },
        },
      };

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
    return xmlbuilder.create(xml).end({ pretty: true, allowEmpty: true });
  },

  buildXMLPRTO002: (data) => {
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
          ...(meting.volume8h && { "@volume8h": meting.volume8h }),
          ...(meting.volume1h && { "@volume1h": meting.volume1h }),
          "@project": meting.project,
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_type,
            "@filter_type": item.filter_type,
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
    return xmlbuilder.create(xml).end({ pretty: true, allowEmpty: true });
  },

  buildXMLPRTO003: (data) => {
    statusXml.start();
    const elements = data.map((item) => {
      if (!item) return {};

      const ontrekkingen = item?.ontrekkingen.map((meting) => {
        if (!meting) return {};
        return {
          "@begin": meting.begin,
          "@einde": meting.einde,
          "@volume": meting.volume,
          "@betrouwb": meting.betrouwb,
          "@project": meting.project,
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_nummer,
            "@filter_type": item.filter_type,
            "@meetnet": item.meetnet,
          },
        },
      };

      ele.put.filter.onttrekking = ontrekkingen;

      ele.put.filter.debietmeter = {
        "@serienummer": item.debietmeter_serienummer,
        "@merk": item.debietmeter_merk,
        "@datum_laatste_ijking": item.debietmeter_laatste_ijking,
      };

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
    return xmlbuilder.create(xml).end({ pretty: true, allowEmpty: true });
  },

  buildXMLPRTO004: (data) => {
    statusXml.start();
    const elements = data.map((item) => {
      if (!item) return {};

      const ontrekkingen = item?.ontrekkingen.map((meting) => {
        if (!meting) return {};
        return {
          "@begin": meting.begin,
          "@einde": meting.einde,
          "@volume": meting.volume,
          "@betrouwb": meting.betrouwb,
          "@project": meting.project,
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_nummer,
            "@filter_type": item.filter_type,
            "@meetnet": item.meetnet,
          },
        },
      };

      ele.put.filter.onttrekking = ontrekkingen;

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
    return xmlbuilder.create(xml).end({ pretty: true, allowEmpty: true });
  },

  buildXMLPRTO005: (data) => {
    statusXml.start();
    const elements = data.map((item) => {
      if (!item) return {};

      const ontrekkingen = item?.ontrekkingen.map((meting) => {
        if (!meting) return {};
        return {
          "@begin": meting.begin,
          "@einde": meting.einde,
          "@volume": meting.volume,
          "@betrouwb": meting.betrouwb,
          "@project": meting.project,
        };
      });

      const ele = {
        put: {
          "@put_nummer": item.put_nummer,
          filter: {
            "@nummer": item.filter_nummer,
            "@filter_type": item.filter_type,
            "@meetnet": item.meetnet,
          },
        },
      };

      const filter_type = item.filter_type.match(/filter/gi) ? item.filter_type : null;
      if (filter_type) ele.put.filter[filter_type] = {};

      ele.put.filter.onttrekking = ontrekkingen;

      ele.put.filter.debietmeter = {
        "@serienummer": item.debietmeter_serienummer,
        "@merk": item.debietmeter_merk,
        "@datum_laatste_ijking": item.debietmeter_laatste_ijking,
      };

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
    return xmlbuilder.create(xml).end({ pretty: true, allowEmpty: true });
  },
};
