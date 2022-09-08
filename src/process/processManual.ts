import fs from 'fs-jetpack';
import chalk from 'chalk';
import path from 'path';
import { FlightMeta } from '../types';

const defaultFlightMeta: FlightMeta = {
  distance: 0,
  duration: null,
  date: new Date().toISOString(),
  glider: null,
  landing_date: null,
  landing_pos: null,
  landing_location: '',
  max_altitude: null,
  pilot: null,
  copilot: null,
  takeoff_date: new Date().toISOString(),
  takeoff_pos: null,
  takeoff_location: '',
  timezone: null,
  filename: '',
  filepath: null,
  numFlight: null,
  registration: null,
  callsign: null,
  competitionClass: null,
  loggerId: null,
  loggerManufacturer: null,
  xcDistance: null,
  xcScore: null,
  xcType: null,
  xcCode: null,
  best_thermal_avg_vario: null,
  sport: null,
};

export async function processManual(metaPath: string, manualPath: string) {
  try {
    const fileNameManual = path.basename(manualPath);
    const fileName = fileNameManual.replace('.manual.json', '');
    const igcMetaJsonFilePath = path.join(metaPath, fileName + '.meta.json');

    const manualData = await fs.readAsync(manualPath, 'json');

    const metaJsonFileExist = fs.exists(igcMetaJsonFilePath);

    let meta: FlightMeta;

    if (metaJsonFileExist) {
      meta = await fs.readAsync(igcMetaJsonFilePath, 'json');
    } else {
      meta = {
        ...defaultFlightMeta,
        filename: fileNameManual,
        filepath: path.resolve(manualPath),
      };
    }

    const metaOE = Object.entries(meta);
    const newMeta: Record<string, any> = { ...meta };

    for (const [key, _] of metaOE) {
      const newValue = manualData[key];
      if (typeof newValue !== 'undefined') {
        newMeta[key] = newValue;
      }
    }

    await fs.writeAsync(igcMetaJsonFilePath, newMeta);
  } catch (error) {
    console.log(error);
    console.error(
      '%s Processing manual file ' + manualPath,
      chalk.red.bold('ERROR'),
    );
    return null;
  }
}
