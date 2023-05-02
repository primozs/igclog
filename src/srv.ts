import { initWatchMode } from './watch.js';
import { Options } from './types.js';
import { getConfig } from './config.js';
import path from 'path';

async function main() {
  const options: Options = {
    skipPrompts: false,
    onlyFindIGCFiles: false,
    directory: '',
    deleteMeta: false,
    auth: false,
    elevations: false,
    help: false,
    version: false,
    configuration: false,
    displaySettings: false,
    setInitialValues: false,
    generateCsv: false,
    recalculateFrom: false,
    distance: undefined,
    duration: undefined,
    flights: undefined,
    username: undefined,
    password: undefined,
    pilot: undefined,
    glider: undefined,
    storeDefaultDir: false,
    recYear: undefined,
    recMonth: undefined,
    recDay: undefined,
    watchMode: true,
  };

  const config = await getConfig();

  if (!config) {
    console.log('igclogsrv requires configuration');
    process.exit(1);
  }

  let directory = options.directory
    ? path.resolve(options.directory)
    : config?.directory
    ? config.directory
    : process.cwd();

  options.directory = directory;

  await initWatchMode(options, config);
}

main();
