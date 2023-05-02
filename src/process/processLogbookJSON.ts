import { Config, FlightMeta } from '../types.js';
import fs from 'fs-jetpack';
import { findFiles } from './findFiles.js';
import chalk from 'chalk';
import path from 'path';

export const processLogbookJson = async (
  metaPath: string,
  config: Config | null,
) => {
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

  const dupes: [string, string, string, string, string, string][] = [];
  for (const item of compares) {
    const dup = compares.find((c) => {
      return (
        item.filepath !== c.filepath &&
        item.takeoff_date >= c.takeoff_date &&
        item.takeoff_date <= c.landing_date
      );
    });

    if (dup) {
      dupes.push([
        item.filepath,
        dup.filepath,
        new Date(item.takeoff_date).toISOString(),
        new Date(item.landing_date).toISOString(),
        new Date(dup.takeoff_date).toISOString(),
        new Date(dup.landing_date).toISOString(),
      ]);
    }
  }

  if (dupes.length > 0) {
    console.log('');
    console.log('%s Duplicate files', chalk.yellow.bold('DUPLICATES'));
    console.log('');
    for (const [first, second, t1, l1, t2, l2] of dupes) {
      console.log(chalk.green.bold(first), chalk.yellow.bold(second));
      console.log(chalk.green.bold(t1), chalk.green.bold(l1));
      console.log(chalk.yellow.bold(t2), chalk.yellow.bold(l2));
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
