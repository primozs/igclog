import arg from 'arg';
import inquirer from 'inquirer';
import { Options, Config } from './types';
import { main } from './main';
import path from 'path';
import { printHelp } from './print';
import { setConfig, getConfig } from './config';

function parseArgs(rawArgs: any) {
  try {
    const args = arg(
      {
        '--yes': Boolean,
        '--directory': String,
        '--deleteMeta': Boolean,
        '--onlyFindIGCFiles': Boolean,
        '--authenticate': Boolean,
        '--help': Boolean,
        '--version': Boolean,
        '--elevations': Boolean,
        '--configuration': Boolean,
        '--displaySettings': Boolean,
        '--setInitialValues': Boolean,
        '--generateCsv': Boolean,
        '--recalculateFrom': Boolean,
        '--watchMode': Boolean,
        '-y': '--yes', // skip prompts
        '-f': '--onlyFindIGCFiles', // Find and list igc files,
        '-d': '--directory', // Set the directory from which to begin searching. By default, starting-point is .
        '-z': '--deleteMeta', // Delete meta json files
        '-c': '--configuration', // Set default configuration
        '-a': '--authenticate', // authenticate
        '-e': '--elevations', // query and store elevations json
        '-l': '--locations', // query takeoff and landing location
        '-g': '--generateCsv',
        '-r': '--recalculateFrom',
        '-s': '--displaySettings',
        '-i': '--setInitialValues',
        '-w': '--watchMode',
        '-h': '--help',
        '-v': '--version',
      },
      {
        argv: rawArgs.slice(2),
      },
    );
    return {
      skipPrompts: args['--yes'] || false,
      onlyFindIGCFiles: args['--onlyFindIGCFiles'] || false,
      directory: args['--directory'],
      deleteMeta: args['--deleteMeta'] || false,
      auth: args['--authenticate'] || false,
      elevations: args['--elevations'] || false,
      help: args['--help'] || false,
      version: args['--version'] || false,
      configuration: args['--configuration'] || false,
      displaySettings: args['--displaySettings'] || false,
      setInitialValues: args['--setInitialValues'] || false,
      generateCsv: args['--generateCsv'] || false,
      recalculateFrom: args['--recalculateFrom'] || false,
      watchMode: args['--watchMode'] || false,
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
    };
  } catch (error) {
    printHelp();
    process.exit(0);
  }
}

async function promptMissingOptions(options: Options, config: Config) {
  let directory = options.directory
    ? path.resolve(options.directory)
    : config.directory
    ? config.directory
    : process.cwd();

  if (options.skipPrompts) {
    return {
      ...options,
      directory,
    };
  }

  const questions = [];

  if (options.directory && !options.watchMode) {
    questions.push({
      type: 'confirm',
      name: 'storeDefaultDir',
      message: `Do you want to store this directory as default: ${path.resolve(
        options.directory,
      )}`,
      default: false,
    });
  }

  if (options.recalculateFrom) {
    questions.push({
      type: 'input',
      name: 'recYear',
      message: 'Enter Year (YYYY):',
    });
    questions.push({
      type: 'input',
      name: 'recMonth',
      message: 'Enter Month (MM):',
    });
    questions.push({
      type: 'input',
      name: 'recDay',
      message: 'Enter Day (DD):',
    });
  }

  if (options.setInitialValues) {
    questions.push({
      type: 'input',
      name: 'distance',
      message: 'Enter enter initial total kilometers:',
    });
    questions.push({
      type: 'input',
      name: 'duration',
      message: 'Enter enter initial total hours:',
    });
    questions.push({
      type: 'input',
      name: 'flights',
      message: 'Enter enter initial total no. flights:',
    });
  }

  if (options.configuration) {
    questions.push({
      type: 'input',
      name: 'pilot',
      message: 'Enter default pilot name:',
    });

    questions.push({
      type: 'input',
      name: 'glider',
      message: 'Enter default glider:',
    });
  }

  if (options.auth) {
    questions.push({
      type: 'input',
      name: 'username',
      message: 'Enter email: ',
    });

    questions.push({
      type: 'password',
      name: 'password',
      message: 'Enter password: ',
    });
  }

  if (options.deleteMeta) {
    questions.push({
      type: 'confirm',
      name: 'deleteMeta',
      message: 'Are you sure to delete all meta files?',
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);

  if (answers.storeDefaultDir && options.directory) {
    await setConfig({
      directory: path.resolve(options.directory),
    });
  }

  return {
    ...options,
    deleteMeta: options.deleteMeta ? answers.deleteMeta : options.deleteMeta,
    username: answers.username,
    password: answers.password,
    pilot: answers.pilot,
    glider: answers.glider,
    directory,
    storeDefaultDir: answers.storeDefaultDir,
    distance: answers.distance,
    duration: answers.duration,
    flights: answers.flights,
    recYear: answers.recYear,
    recMonth: answers.recMonth,
    recDay: answers.recDay,
  };
}

export async function cli(args: any) {
  const config = await getConfig();
  let options = parseArgs(args);

  if (!options.watchMode) {
    options = await promptMissingOptions(options, config);
  }

  main(options, config);
}
