import { Config, Options } from './types';
import chokidar from 'chokidar';
import chalk from 'chalk';
import { lookupInit } from './services/location';
import path from 'path';
import { processAllFiles } from './process/processAllFiles';

export const initWatchMode = async (
  options: Options,
  config: Config | null,
) => {
  const dir = options.directory || config?.directory;
  if (!dir) {
    console.error('%s Working folder not known', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  await lookupInit(options, config);
  console.log(chalk.green.bold('Watching folder: ' + path.resolve(dir)));

  const watcher = chokidar
    .watch(dir, {
      persistent: true,
      ignoreInitial: true,
      ignored: '*.json',
    })
    .on('add', async (path) => {
      if (path.endsWith('.igc') || path.endsWith('.manual.json')) {
        await processAllFiles(options, config);
      }
    })
    .on('change', async (path) => {
      if (path.endsWith('.manual.json')) {
        await processAllFiles(options, config);
      }
    })
    .on('unlink', async (path) => {
      if (path.endsWith('.igc') || path.endsWith('.manual.json')) {
        await processAllFiles(options, config);
      }
    });
};
