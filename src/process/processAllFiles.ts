import fs from 'fs-jetpack';
import path from 'path';
import chalk from 'chalk';
import { processIgc } from './processIgc.js';
import { processManual } from './processManual.js';
import { processLogbookJson } from './processLogbookJSON.js';
import { findFiles } from './findFiles.js';
import { generateXlsx } from './generateXlsx.js';
import { generateCsv } from './generateCsv.js';
import { Options, Config, FlightMeta } from '../types.js';

const missingIGCsMetaClean = async (metaPath: string) => {
  const metaList = await findFiles(metaPath, '*.meta.json');

  // check igc still exists
  for (const filePath of metaList) {
    let meta = (await fs.readAsync(filePath, 'json')) as FlightMeta;
    if (!meta || !meta.filepath) continue;

    let fileName = path.basename(filePath);
    let igcFileName = fileName.replace('.meta.json', '');

    let igcPath = path.resolve(meta.filepath);

    if (!fs.exists(igcPath)) {
      const igcJsonFilePath = path.join(metaPath, igcFileName + '.pos.json');
      const igcOptJsonFilePath = path.join(metaPath, igcFileName + '.opt.json');
      const igcOptGeoJsonFilePath = path.join(
        metaPath,
        igcFileName + '.opt.geojson',
      );
      const igcElvJsonFilePath = path.join(
        metaPath,
        igcFileName + '.elev.json',
      );
      const igcMetaJsonFilePath = path.join(
        metaPath,
        igcFileName + '.meta.json',
      );

      await fs.removeAsync(igcJsonFilePath);
      await fs.removeAsync(igcOptJsonFilePath);
      await fs.removeAsync(igcElvJsonFilePath);
      await fs.removeAsync(igcMetaJsonFilePath);
      await fs.removeAsync(igcOptGeoJsonFilePath);
    }
  }
};

export const processAllFiles = async (
  options: Options,
  config: Config | null,
) => {
  if (!options.directory || !fs.exists(options.directory)) {
    console.error('%s Directory does not exist', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const metaPath = path.join(options.directory, 'meta');
  const list = await findFiles(options.directory);
  const manualList = await findFiles(options.directory, '*.manual.json');

  await missingIGCsMetaClean(metaPath);

  for (const igcPath of list) {
    await processIgc(metaPath, igcPath, options, config);
  }

  console.log('IGC files processed: ', chalk.green.bold(list.length));

  for (const manualPath of manualList) {
    await processManual(metaPath, manualPath);
  }

  console.log(
    'Manual flights and updates: ',
    chalk.green.bold(manualList.length),
  );

  const logbook = await processLogbookJson(metaPath, config);
  await generateXlsx(logbook, metaPath, config);

  if (options.generateCsv) {
    await generateCsv(logbook, metaPath, config);
  }
};
