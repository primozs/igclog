import fs from 'fs-jetpack';
import chalk from 'chalk';

const findHashDuplicates = async (paths: string[]) => {
  const fileHashes: { path: string; hash: string }[] = [];

  for (const path of paths) {
    const res = fs.inspect(path, { checksum: 'sha256' });

    const hash = res?.sha256;
    if (hash) {
      fileHashes.push({ path, hash });
    }
  }

  const dupes: [string, string][] = [];
  for (const fh of fileHashes) {
    const dup = fileHashes.find((item) => {
      return item.hash === fh.hash && item.path !== fh.path;
    });
    if (dup) dupes.push([fh.path, dup.path]);
  }

  if (dupes.length > 0) {
    console.log('');
    console.log('%s Duplicate files', chalk.yellow.bold('DUPLICATES'));
    console.log('');
    for (const [first, second] of dupes) {
      console.log(chalk.green.bold(first), chalk.yellow.bold(second));
    }
  }

  return dupes;
};

export const findDuplicates = async (paths: string[]) => {
  return await findHashDuplicates(paths);
};
