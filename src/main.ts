import { Options, Config } from './types.js';
import fs from 'fs-jetpack';
import path from 'path';
import chalk from 'chalk';
import { printHelp, getVersion } from './print.js';
import { authenticateLocal } from './services/services.js';
import { setConfig } from './config.js';
import { findFiles } from './process/findFiles.js';
import { initWatchMode } from './watch.js';
import { processAllFiles } from './process/processAllFiles.js';
import { lookupInit } from './services/location.js';
import { findDuplicates } from './process/findDuplicates.js';

async function deleteMetaFiles(metaPath: string) {
  try {
    await fs.remove(metaPath);
  } catch (error) {
    console.error('%s Delete meta  ', chalk.red.bold('ERROR'));
  }
}

export async function main(options: Options, config: Config | null) {
  if (!options.directory || !fs.exists(options.directory)) {
    console.error('%s Directory does not exist', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  console.log('Working directory: ', chalk.green.bold(options.directory));

  const metaPath = path.join(options.directory, 'meta');

  fs.dir(metaPath);

  if (options.watchMode) {
    await initWatchMode(options, config);
    return;
  }

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
    const list = await findFiles(options.directory);
    await findDuplicates(list);
    console.log('');
    console.log(chalk.green.bold('All FOUND FILES'));
    console.table(list);
    process.exit(0);
  }

  if (options.deleteMeta) {
    await deleteMetaFiles(metaPath);
    process.exit(0);
  }

  await lookupInit(options, config);
  await processAllFiles(options, config);
  process.exit(0);
}
