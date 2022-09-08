import fs from 'fs-jetpack';

export const printHelp = () => {
  console.log(`
  -d  --directory             Set the directory from which to begin searching. By default, starting-point is .
  -f  --onlyFindIGCFiles      Find and list igc files
  -z  --deleteMeta            Delete meta json files
  -y  --yes                   Skip prompts  
  -c  --configuration         Set default configuration
  -a  --authenticate          Authenticate api for location and elevation data
  -e  --elevations            Query elevation data. Requires authentication
  -g  --generateCsv           Generate CSV file
  -r  --recalculateFrom       Recalculate from date
  -s  --displaySettings       Display settings
  -i  --setInitialValues      Set initial starting total distance duration number of flights
  -w  --watchMode             Files watch mode. For linux daemon "$ nohup igclog -d ./data/ -w >/tmp/igclog.out 2>/tmp/igclog.error&"
  -h  --help                  Help
  -v  --version               Version  
`);
};

export const getVersion = async () => {
  const packageJson = __dirname + '/../package.json';

  const packageData = await fs.readAsync(packageJson, 'json');

  return packageData.version;
};
