import { spawn, Thread, Worker } from 'threads';
import IgcParser from 'igc-parser';
import fs from 'fs-jetpack';
import chalk from 'chalk';
import path from 'path';
import { FlightMeta, Options, FlightMetaCu, Config } from '../types';
import { getTimezone, getElevations } from '../services/services';
import { reverseGeolookup } from '../services/location';

export async function processIgc(
  metaPath: string,
  filePath: string,
  options: Options,
  config: Config | null,
) {
  try {
    let recDate: Date | null = null;
    if (options.recYear && options.recMonth && options.recDay) {
      recDate = new Date(
        `${options.recYear}-${options.recMonth}-${options.recDay}T00:00:00.000Z`,
      );
    }

    const fileName = path.basename(filePath);
    console.log('%s ' + fileName, chalk.green.bold('PROCESSING'));

    const igcJsonFilePath = path.join(metaPath, fileName + '.pos.json');
    const igcOptJsonFilePath = path.join(metaPath, fileName + '.opt.json');
    const igcOptGeoJsonFilePath = path.join(
      metaPath,
      fileName + '.opt.geojson',
    );
    const igcElvJsonFilePath = path.join(metaPath, fileName + '.elev.json');
    const igcMetaJsonFilePath = path.join(metaPath, fileName + '.meta.json');

    const igcJsonFileExist = fs.exists(igcJsonFilePath);
    const optJsonFileExist = fs.exists(igcOptJsonFilePath);
    const elvJsonFileExist = fs.exists(igcElvJsonFilePath);
    const metaJsonFileExist = fs.exists(igcMetaJsonFilePath);

    let igcJson: IgcParser.IGCFile | null = null;
    let metaJson: FlightMeta | null = null;

    if (metaJsonFileExist && recDate) {
      metaJson = (await fs.readAsync(
        igcMetaJsonFilePath,
        'json',
      )) as FlightMeta;
    }

    if (metaJsonFileExist && !recDate) {
      return;
    }

    if (
      metaJsonFileExist &&
      metaJson &&
      metaJson.takeoff_date &&
      recDate &&
      recDate.getTime() > new Date(metaJson.takeoff_date).getTime()
    ) {
      return;
    }

    // get existing positions file
    if (igcJsonFileExist) {
      igcJson = (await fs.readAsync(
        igcJsonFilePath,
        'json',
      )) as IgcParser.IGCFile;
    } else {
      // generate and store new positions file
      const igcData = await fs.readAsync(filePath, 'utf8');
      const igcToJson = await spawn(new Worker('./igcToJsonWorker'));

      if (igcData) {
        igcJson = (await igcToJson(igcData)) as IgcParser.IGCFile;
        await fs.writeAsync(igcJsonFilePath, igcJson);
      }

      await Thread.terminate(igcToJson);
    }

    if (!igcJson) return;

    if (options.elevations && !elvJsonFileExist) {
      const jsonStr = await getElevations(igcJson);
      jsonStr && (await fs.writeAsync(igcElvJsonFilePath, jsonStr));
    }

    let igcOptJson: any = null;
    if (optJsonFileExist) {
      const fullData = await fs.readAsync(igcOptJsonFilePath, 'json');
      const jsonData = await fs.readAsync(igcOptGeoJsonFilePath, 'json');
      const meta = await fs.readAsync(igcMetaJsonFilePath, 'json');
      igcOptJson = { fullData, jsonData, meta };
    } else {
      const calcIgcOpt = await spawn(new Worker('./calcIgcOptWorker'));
      igcOptJson = await calcIgcOpt(igcJson);
      await Thread.terminate(calcIgcOpt);
    }

    if (!igcOptJson) return;

    let meta: FlightMeta | null = null;
    meta = igcOptJson.meta as FlightMeta;
    meta.filename = fileName;
    meta.filepath = path.resolve(filePath);

    if ((!meta.pilot || meta.pilot === 'Unknown') && config?.pilot)
      meta.pilot = config.pilot;

    if (!meta.glider && config?.glider) meta.glider = config.glider;

    if (meta.takeoff_pos) {
      const timezone = await getTimezone(meta.takeoff_pos, meta.takeoff_date);
      meta.timezone = timezone;
    }

    if (!meta.takeoff_location && meta.takeoff_pos) {
      const loc = await reverseGeolookup(
        meta.takeoff_pos[1],
        meta.takeoff_pos[0],
        't',
        5,
      );
      meta.takeoff_location = loc;
    }

    if (!meta.landing_location && meta.landing_pos) {
      const loc = await reverseGeolookup(
        meta.landing_pos[1],
        meta.landing_pos[0],
        'l',
        5,
      );
      meta.landing_location = loc;
    }

    // cu old meta
    const oldMeta = (await fs.readAsync(
      path.resolve(metaPath, '..', '..', 'cu', fileName + '.json'),
      'json',
    )) as FlightMetaCu;

    if (oldMeta) {
      meta.distance = oldMeta.distance;
      meta.duration = oldMeta.duration;
      meta.glider = oldMeta.glider;
      meta.landing_date = oldMeta.landing_date ?? meta.landing_date;
      // meta.landing_location =
      //   oldMeta.landing_location ?? meta.landing_location;
      meta.pilot = oldMeta.pilot;
      meta.takeoff_date = oldMeta.takeoff_date ?? meta.takeoff_date;
      // meta.takeoff_location =
      //   oldMeta.takeoff_location ?? meta.takeoff_location;
      meta.best_thermal_avg_vario =
        oldMeta.best_thermal_avg_vario ?? meta.best_thermal_avg_vario;
      meta.sport = oldMeta.sport?.toLowerCase() ?? meta.sport?.toLowerCase();
      meta.registration = oldMeta.glider_registration ?? meta.registration;
      meta.callsign = oldMeta.competition_number ?? meta.callsign;
      meta.favorite = oldMeta.favorite || meta.favorite;
    }

    if (meta.sport === 'paragliders' || meta.sport === 'paraglider') {
      meta.sport = 'paragliding';
    }

    await fs.writeAsync(igcMetaJsonFilePath, meta);

    if (igcOptJson) {
      await fs.writeAsync(igcOptJsonFilePath, igcOptJson.fullData);
      await fs.writeAsync(igcOptGeoJsonFilePath, igcOptJson.jsonData);
    }
  } catch (error) {
    console.log(error);
    console.error('%s Processing file ' + filePath, chalk.red.bold('ERROR'));
  }
}
