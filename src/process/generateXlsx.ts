import { Config, FlightMeta } from '../types';
import path from 'path';
import ExcelJS from 'exceljs';

const styleWidth = (cm: number) => {
  return cm / 0.25;
};

function sToHMS(duration: number) {
  if (duration === undefined) return { d: 0, h: 0, m: 0, s: 0 };

  let h = Math.floor(duration / 3600);
  let sh = String(h).padStart(2, '0');

  let m = Math.floor((duration / 60) % 60);
  let s = (duration - m * 60) % 60;

  let sm = String(m).padStart(2, '0');
  let ss = String(Math.round(s)).padStart(2, '0');
  return { h: sh, m: sm, s: ss };
}

export const generateXlsx = async (
  logbook: FlightMeta[],
  metaPath: string,
  config: Config | null,
) => {
  const filepath = path.resolve(metaPath, '..', 'logbook.xlsx');
  const workbook = new ExcelJS.Workbook();
  if (config?.pilot) {
    workbook.creator = config.pilot;
    workbook.lastModifiedBy = config.pilot;
  }
  workbook.creator = 'igclog';
  workbook.lastModifiedBy = 'igclog';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const firstRowInd = 9;

  const wsFlights = workbook.addWorksheet('Flights', {
    views: [
      {
        state: 'frozen',
        xSplit: 4,
        ySplit: firstRowInd,
      },
    ],
  });

  wsFlights.mergeCells('A1', 'D8');
  wsFlights.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'eeeeee' },
  };

  wsFlights.mergeCells('E1', 'S1');
  wsFlights.getCell('E1').value = `${config?.pilot || ''} flight logbook`;

  const titleRow = wsFlights.getRow(1);
  titleRow.height = 35;

  wsFlights.getCell('E1').font = {
    name: 'Calibri',
    family: 4,
    size: 16,
    bold: true,
  };

  wsFlights.getCell('E1').alignment = {
    vertical: 'middle',
    horizontal: 'left',
  };

  const headerRow = wsFlights.getRow(firstRowInd);
  headerRow.values = [
    '#',
    'Year',
    'Month',
    'Date',
    'Location',
    'Glider',
    'Distance',
    'Distance m',
    'Duration',
    'Duration s',
    'XCDistance',
    'XcDistance m',
    'XcScore',
    'XcType',
    'Max alt.',
    // 'Best thermal avg.',
    'Landing',
    'Landing date',
    'Pilot',
    'Sport',
    'TZ',
    'Filename',
    'Filepath',
    'XcCode',
    'Favorite',
  ];

  headerRow.height = 35;
  headerRow.font = {
    name: 'Calibri',
    family: 4,
    size: 12,
    bold: true,
  };
  headerRow.eachCell((cell) => {
    cell.fill = {
      fgColor: { argb: 'dddddd' },
      pattern: 'solid',
      type: 'pattern',
    };
  });

  wsFlights.columns = [
    {
      key: 'index',
      width: styleWidth(1.3),
      style: {
        alignment: {
          horizontal: 'center',
        },
      },
    },
    {
      key: 'year',
      width: styleWidth(2.5),
      style: {
        numFmt: '0',
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'month',
      width: styleWidth(2.5),
      style: {
        numFmt: '0',
        alignment: { horizontal: 'left' },
      },
    },
    {
      key: 'takeoff_date',
      width: styleWidth(4.5),
      style: {
        numFmt: 'DD.MM.YYYY HH:mm',
        alignment: { horizontal: 'left' },
      },
    },
    {
      key: 'takeoff_location',
      width: styleWidth(7),
    },
    {
      key: 'glider',
      width: styleWidth(6.5),
    },
    {
      key: 'distance',
      width: styleWidth(3),
      style: {
        numFmt: '0.0',
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'distance_m',
      width: styleWidth(4),
      hidden: true,
    },
    {
      key: 'duration',
      width: styleWidth(3),
      style: {
        numFmt: '[h]:mm:ss',
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'duration_s',
      width: styleWidth(4),
      hidden: true,
    },
    {
      key: 'xcDistance',
      width: styleWidth(3),
      style: {
        numFmt: '0.0',
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'xc_distance_m',
      width: styleWidth(4),
      hidden: true,
    },
    {
      key: 'xcScore',
      width: styleWidth(3),
      style: {
        numFmt: '0.0',
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'xcType',
      width: styleWidth(5),
    },

    {
      key: 'max_altitude',
      width: styleWidth(3),
      style: {
        alignment: { horizontal: 'center' },
      },
    },
    // {
    //   key: 'best_thermal_avg_vario',
    //   width: styleWidth(5),
    //   style: {
    //     numFmt: '0.0',
    //   },
    // },
    {
      key: 'landing_location',
      width: styleWidth(7),
    },
    {
      key: 'landing_date',
      width: styleWidth(4.5),
      style: {
        numFmt: 'DD.MM.YYYY HH:mm',
        alignment: { horizontal: 'left' },
      },
    },
    {
      key: 'pilot',
      width: styleWidth(4.5),
    },
    {
      key: 'sport',
      width: styleWidth(4.5),
    },
    {
      key: 'timezone',
      width: styleWidth(3),
      style: {
        alignment: { horizontal: 'center' },
      },
    },
    {
      key: 'filename',
      width: styleWidth(9),
    },
    {
      key: 'filepath',
      width: styleWidth(20),
    },

    {
      key: 'xcCode',
      width: styleWidth(3),
    },
    {
      key: 'favorite',
      width: styleWidth(3),
    },
  ];

  for (let i = 0, len = logbook.length; i < len; i++) {
    const log = logbook[i];

    const dd = log.duration ? sToHMS(log.duration) : null;

    const td = log.takeoff_date ? new Date(log.takeoff_date) : null;
    let year: number | null = td ? td.getFullYear() : null;
    let month: string | null = td
      ? td.toLocaleString('en-GB', { month: 'long' })
      : null;

    wsFlights.addRow({
      index: i + 1,
      year: year,
      month: month,
      takeoff_date: td,
      takeoff_location: log.takeoff_location,
      glider: log.glider,
      distance: {
        formula: `H${i + 1 + firstRowInd} / 1000`,
      },
      duration: dd
        ? new Date(
            Date.UTC(1899, 11, 30, Number(dd.h), Number(dd.m), Number(dd.s), 0),
          )
        : 0, // H
      xcDistance: {
        formula: `L${i + 1 + firstRowInd} / 1000`,
      },
      xcScore: log.xcScore,
      xcType: log.xcType,
      xcCode: log.xcCode,
      max_altitude: log.max_altitude,
      best_thermal_avg_vario: log.best_thermal_avg_vario,
      landing_location: log.landing_location,
      landing_date: log.landing_date ? new Date(log.landing_date) : null,
      pilot: log.pilot,
      sport: log.sport,
      timezone: log.timezone,
      filename: log.filename,
      filepath: log.filepath,
      distance_m: log.distance,
      xc_distance_m: log.xcDistance,
      duration_s: log.duration,
      favorite: log.favorite,
    });
  }

  const summaryFont = {
    name: 'Calibri',
    family: 4,
    size: 12,
    bold: true,
  };

  // init duration
  wsFlights.getCell('E3').value = 'Init duration';
  wsFlights.getCell('E3').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };

  const tdd = config?.duration ? sToHMS(config.duration) : null;

  const initDuration = tdd
    ? new Date(
        Date.UTC(1899, 11, 30, Number(tdd.h), Number(tdd.m), Number(tdd.s), 0),
      )
    : 0;

  // @ts-ignore
  wsFlights.getCell('E4').value = initDuration;
  wsFlights.getCell('E4').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
    numFmt: '[h]:mm:ss',
  };

  // init distance
  wsFlights.getCell('F3').value = 'Init distance';
  wsFlights.getCell('F3').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };
  // @ts-ignore
  wsFlights.getCell('F4').value = config?.distance ? config.distance / 1000 : 0;
  wsFlights.getCell('F4').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
    numFmt: '0.0',
  };

  // init no. flights
  wsFlights.mergeCells('G3', 'I3');
  wsFlights.getCell('G3').value = 'Init no. flights';
  wsFlights.getCell('G3').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };
  wsFlights.mergeCells('G4', 'I4');
  wsFlights.getCell('G4').value = config?.flights ?? 0;
  wsFlights.getCell('G4').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };

  //  total duration
  wsFlights.getCell('E6').value = 'Total duration';
  wsFlights.getCell('E6').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };

  // @ts-ignore
  wsFlights.getCell('E7').value = {
    formula: `E4+SUBTOTAL(9,I${firstRowInd + 1}:I${
      firstRowInd + logbook.length
    })`,
  };
  wsFlights.getCell('E7').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
    numFmt: '[h]:mm:ss',
  };

  // Total distance
  wsFlights.getCell('F6').value = 'Total distance';
  wsFlights.getCell('F6').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };
  // @ts-ignore
  wsFlights.getCell('F7').value = {
    formula: `F4+SUBTOTAL(9,G${firstRowInd + 1}:G${
      firstRowInd + logbook.length
    })`,
  };
  wsFlights.getCell('F7').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
    numFmt: '0.0',
  };

  // total number of flights
  wsFlights.mergeCells('G6', 'I6');
  wsFlights.getCell('G6').value = 'No. flights';
  wsFlights.getCell('G6').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };
  wsFlights.mergeCells('G7', 'I7');
  // @ts-ignore
  wsFlights.getCell('G7').value = {
    formula: `G4+SUBTOTAL(3,A10:A${firstRowInd + logbook.length})`,
  };
  wsFlights.getCell('G7').style = {
    font: summaryFont,
    alignment: { horizontal: 'center' },
  };

  wsFlights.autoFilter = {
    from: `A${firstRowInd}`,
    to: `U${firstRowInd}`,
  };

  await workbook.xlsx.writeFile(filepath, {
    useStyles: true,
  });
};
