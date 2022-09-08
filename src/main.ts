import { Options, Config } from './types';
import fs from 'fs-jetpack';
import path from 'path';
import chalk from 'chalk';
import { processIgc } from './process/processIgc';
import { processManual } from './process/processManual';
import { printHelp, getVersion } from './print';
import { authenticateLocal } from './services/services';
import { setConfig } from './config';
import { processLogbookJson } from './process/processLogbookJSON';
import { findFiles } from './process/findFiles';
import { generateXlsx } from './process/generateXlsx';
import { generateCsv } from './process/generateCsv';
import { lookupInit } from './services/location';

async function deleteMetaFiles(metaPath: string) {
  try {
    await fs.remove(metaPath);
  } catch (error) {
    console.error('%s Delete meta  ', chalk.red.bold('ERROR'));
  }
}

export async function main(options: Options, config: Config) {
  if (!options.directory || !fs.exists(options.directory)) {
    console.error('%s Directory does not exist', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  console.log('Working directory: ', chalk.green.bold(options.directory));

  const metaPath = path.join(options.directory, 'meta');

  fs.dir(metaPath);

  const list = await findFiles(options.directory);

  const manualList = await findFiles(options.directory, '*.manual.json');

  if (options.displaySettings) {
    console.log(JSON.stringify(config, null, 2));
    process.exit(0);
  }

  if (options.setInitialValues) {
    await setConfig({
      distance: options.distance ? options.distance * 1000 : 0,
      duration: options.duration ? options.duration * 60 * 60 : 0,
      flights: options.flights ?? 0,
    });

    process.exit(0);
  }

  if (options.configuration) {
    await setConfig({
      pilot: options.pilot,
      glider: options.glider,
    });
    process.exit(0);
  }

  if (options.auth) {
    await authenticateLocal(options.username, options.password);
    process.exit(0);
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    const version = await getVersion();
    console.log(chalk.blue.bold(version));
    process.exit(0);
  }

  if (options.onlyFindIGCFiles) {
    console.log(list);
    process.exit(0);
  }

  if (options.deleteMeta) {
    await deleteMetaFiles(metaPath);
    process.exit(0);
  }

  await lookupInit();
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

  process.exit(0);
}
