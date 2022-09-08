# IGCLog

Terminal tool to generate spreadsheet flights logbook from igc files. If your tracklogs are scattered around your disk this tool can also help you find them.

1. Sync your tracklogs between different devices with [Syncthing](https://syncthing.net/)
2. Use `igclog` to generate logbook spreadsheet file.
3. If you will run this on the server you can sync back the result to your devices

## Install

`$ npm install -g igclog`

## Optional arguments

```text

-d  --directory             Set the directory from which to begin searching. By default, starting-point is "."
-f  --onlyFindIGCFiles      Find and list igc files
-z  --deleteMeta            Delete meta json files
-c  --configuration         Set default configuration
-y  --yes                   Skip prompts
-a  --authenticate          Authenticate api for elevation data
-e  --elevations            Query elevation data. Requires authentication
-g  --generateCsv           Generate CSV file
-r  --recalculateFrom       Recalculate from date
-s  --displaySettings       Display settings
-i  --setInitialValues      Set initial starting total distance duration number of flights
-h  --help                  Help
-v  --version               Version

```

## Examples

- Generate logbook: `$ igclog -d ./data`
- Find igc files: `$ igclog -f -d ./data`
- Set default configuration (pilot name, glider): `$ igclog -c`
- Delete cached meta files generated by IGCLog: `$ igclog -z -d ./data`

## Manual flight logs

To manually log a flight without igc create a file in Tracklogs folder. `<filename_of_your_choose>.manual.json`. To overriding igc metadata create a file with the same name as igc file `<2018-04-29-XCM-EBC-01.igc>.manual.json`

Inside this manual flight json file define object with these all optional properties.

```typescript
type FlightMeta = {
  distance: number; // meters
  duration: number | null; // seconds
  date: string; // without date, date now is used. iso format
  glider: string | null;
  landing_date: string | null; // iso format
  landing_pos: number[] | null; // [lon, lat]
  landing_location: string;
  max_altitude: number | null;
  pilot: string | null;
  copilot: string | null;
  takeoff_date: string | null; // without takeoff_date, date now is used. iso format
  takeoff_pos: number[] | null;
  takeoff_location: string;
  timezone: number | null;
  filename: string;
  numFlight: number | null;
  registration: string | null;
  callsign: string | null;
  competitionClass: string | null;
  loggerId: string | null;
  loggerManufacturer: string | null;
  xcDistance: number | null;
  xcScore: number | null;
  xcType: string | null;
  xcCode: string | null;
  best_thermal_avg_vario: number | null;
  sport: string | null;
};
```

TODO:

- watch mode
- find duplicates, hash time, shape
- package tool
