import { Config, FlightMeta } from '../types.js';
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

export const generateCsv = async (
  logbook: FlightMeta[],
  metaPath: string,
  config: Config | null,
) => {
  const filepath = path.resolve(metaPath, '..', 'logbook.csv');

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

  const firstRowInd = 1;

  const wsFlights = workbook.addWorksheet('Flights');
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

  await workbook.csv.writeFile(filepath, {
    dateUTC: true,
  });
};
