import path from 'path';
import fs from 'fs-jetpack';
import distance from '@turf/distance';
import chalk from 'chalk';
const kdTree = require('kdt');

type Loc = {
  name: string;
  lat: number;
  lon: number;
  t: string;
};

let tree: any;

const distanceFunction = (
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
) => {
  return distance([from.lon, from.lat], [to.lon, to.lat], { units: 'meters' });
};

const source = './src/loc';

const generateLoc = async () => {
  const airports = await fs.readAsync(
    path.resolve(source, 'airports.json'),
    'json',
  );
  const cities = await fs.readAsync(
    path.resolve(source, 'cities.json'),
    'json',
  );
  const takeoffs = await fs.readAsync(
    path.resolve(source, 'takeoffs.json'),
    'json',
  );
  const landings = await fs.readAsync(
    path.resolve(source, 'landings.json'),
    'json',
  );

  const locations: any[] = [];
  for (const item of airports) {
    locations.push({ ...item, t: 'a' });
  }
  for (const item of cities) {
    locations.push({ ...item, t: 'c' });
  }
  for (const item of takeoffs) {
    locations.push({ ...item, t: 't' });
  }
  for (const item of landings) {
    locations.push({ ...item, t: 'l' });
  }

  await fs.writeAsync(path.resolve(source, 'locations.json'), locations, {
    jsonIndent: 0,
  });
};

export const lookupInit = async () => {
  const locPath = path.resolve(source, 'locations.json');
  const locFileExists = fs.exists(locPath);

  // await generateLoc();

  if (locFileExists) {
    console.log(chalk.green.bold('Initializing reverse geocoder ...'));
    const locations = await fs.readAsync(locPath, 'json');

    let dimensions = ['lat', 'lon'];
    tree = kdTree.createKdTree(locations, distanceFunction, dimensions);
  }
};

export const reverseGeolookup = async (
  lat: number,
  lon: number,
  type: 't' | 'l',
  numberOfResults = 1,
): Promise<string> => {
  if (!tree) return '';

  const res = tree.nearest({ lat: lat, lon: lon }, numberOfResults) as
    | [Loc, number][]
    | null;

  if (!res) return '';

  const filtered = res
    .filter(([loc, dist]) => {
      if (type === 't') {
        return loc.t !== 'l';
      } else {
        return loc.t !== 't';
      }
    })
    .sort(([aLoc, aDist], [bLoc, bDist]) => {
      return aDist - bDist;
    });

  const firstResult = filtered[0];
  if (!firstResult) return '';

  const [found, dist] = firstResult;
  return found?.name ?? '';
};
