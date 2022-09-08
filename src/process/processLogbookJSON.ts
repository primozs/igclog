import { Config, FlightMeta } from '../types';
import fs from 'fs-jetpack';
import { findFiles } from './findFiles';
import chalk from 'chalk';
import path from 'path';

export const processLogbookJson = async (metaPath: string, config: Config) => {
  const metaList = await findFiles(metaPath, '*.meta.json');
  const logbook: FlightMeta[] = [];
  for (const metaPath of metaList) {
    try {
      const meta = await fs.readAsync(metaPath, 'json');
      logbook.push(meta);
    } catch (error) {
      console.error('%s Could not read ' + metaPath, chalk.red.bold('ERROR'));
    }
  }

  const sorted = logbook.sort((a, b) => {
    if (!a.takeoff_date) return -1;
    if (!b.takeoff_date) return -1;

    const at = new Date(a.takeoff_date).getTime();
    const bt = new Date(b.takeoff_date).getTime();

    if (at < bt) return 1;
    if (at > bt) return -1;

    return 0;
  });

  await fs.writeAsync(path.join(metaPath, 'logbook.json'), logbook);

  return sorted;
};
