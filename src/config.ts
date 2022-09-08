import chalk from 'chalk';
import fs from 'fs-jetpack';
import path from 'path';
import { homedir } from 'os';
import { Config } from './types';

const defaultConfig: Config = {
  accessToken: null,
  pilot: null,
  glider: null,
  directory: null,
  distance: 0,
  duration: 0,
  flights: 0,
};

export const getConfig = async () => {
  try {
    const data = (await fs.readAsync(
      path.join(homedir(), '.igclog'),
      'json',
    )) as Config;
    return data;
  } catch (error) {
    console.error('%s Read configuration ', chalk.red.bold('ERROR'));
    return defaultConfig;
  }
};

export const setConfig = async (conf: Partial<Config>) => {
  try {
    const old = await getConfig();

    const newConf = { ...defaultConfig, ...old, ...conf };

    await fs.writeAsync(path.join(homedir(), '.igclog'), newConf);
  } catch (error) {
    console.error('%s Write config failed ', chalk.red.bold('ERROR'));
  }
};
