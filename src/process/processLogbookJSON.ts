import { Config, FlightMeta } from '../types';
import fs from 'fs-jetpack';
import { findFiles } from './findFiles';
import chalk from 'chalk';
import path from 'path';

export const processLogbookJson = async (metaPath: string, config: Config) => {
  const metaList = await findFiles(metaPath, '*.meta.json');
  const logbook: FlightMeta[] = [];

  const compares: {
    takeoff_date: number;
    landing_date: number;
    filepath: string;
  }[] = [];

  for (const metaPath of metaList) {
    try {
      const meta = (await fs.readAsync(metaPath, 'json')) as FlightMeta;
      if (meta.takeoff_date && meta.landing_date && meta.filepath) {
        const compare = {
          takeoff_date: new Date(meta.takeoff_date).getTime(),
          landing_date: new Date(meta.landing_date).getTime(),
          filepath: meta.filepath,
        };
        compares.push(compare);
      }
      logbook.push(meta);
    } catch (error) {
      console.error('%s Could not read ' + metaPath, chalk.red.bold('ERROR'));
    }
  }

  const dupes: [string, string][] = [];
  for (const item of compares) {
    const dup = compares.find((c) => {
      return (
        item.filepath !== c.filepath &&
        item.takeoff_date >= c.takeoff_date &&
        item.takeoff_date <= c.landing_date
      );
    });

    if (dup) {
      dupes.push([item.filepath, dup.filepath]);
    }
  }

  if (dupes.length > 0) {
    console.log('');
    console.log('%s Duplicate files', chalk.yellow.bold('DUPLICATES'));
    console.log('');
    for (const [first, second] of dupes) {
      console.log(chalk.green.bold(first), chalk.yellow.bold(second));
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
