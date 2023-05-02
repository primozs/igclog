import { expose } from 'threads/worker';
import { solver, scoringRules } from 'igc-xc-score';
import IgcParser from 'igc-parser';
import { FlightMeta } from '../types';

const calcIgcOpt = (igcJson: IgcParser.IGCFile) => {
  const config = {
    maxcycle: 50, // max execution time per cycle in milliseconds
    noflight: false, // do not include the flight track in the geojson output
    invalid: false, // do not filter invalid GPS fixes
    hp: false, // High Precision mode, use Vincenty's instead of FCC distances, twice slower for a little bit better precision
    trim: true, // auto-trim the flight to its launch and landing points
    progress: 0,
  };

  const flight = igcJson;

  const tend = config.maxcycle
    ? Date.now() + config.maxcycle * 1000
    : Date.now() + 1000;

  let best;
  const it = solver(flight, scoringRules.XContest, config);
  let newbest;
  do {
    newbest = it.next();
    const bestScore = best?.score ?? 0;
    const newBestScore = newbest.value.score ?? 0;
    // console.log(flight.date, newBestScore, newbest.value.opt.scoring.name);

    if (
      best === undefined ||
      (newbest.value.score && newBestScore > bestScore)
    ) {
      best = newbest.value;
    }

    if (config.maxcycle !== undefined && Date.now() > tend) {
      break;
    }
    const mem = process.memoryUsage();
    if (mem.heapUsed / mem.heapTotal > 0.98) {
      console.error(
        'max memory usage reached, allocate more heap memory (--max-old-space-size)                  ',
      );
      break;
    }
  } while (!newbest.done);

  const fullData = JSON.parse(JSON.stringify(best));
  // @ts-ignore
  const jsonData = best.geojson();

  const launchLanding: {
    launch: IgcParser.BRecord;
    landing: IgcParser.BRecord;
  }[] = [];

  for (let l of fullData.opt.flight.ll) {
    const launch = fullData.opt.flight.filtered[l.launch] as IgcParser.BRecord;
    // const launchTime = fullData.opt.flight.filtered[l.launch].time;
    const landing = fullData.opt.flight.filtered[
      l.landing
    ] as IgcParser.BRecord;
    // const landingTime = fullData.opt.flight.filtered[l.landing].time;

    launchLanding.push({
      launch,
      landing,
    });
  }

  const xcType = jsonData?.properties?.type ?? null;
  const xcCode = jsonData?.properties?.code ?? null;
  const xcScore = jsonData?.properties?.score ?? 0;
  const xcDistance = fullData?.scoreInfo?.distance
    ? fullData?.scoreInfo?.distance * 1000
    : 0;

  const launch = jsonData.features.find((item: any) => item.id === 'launch0');
  const launchTime = launch?.properties?.timestamp ?? null;
  const launchPos = launch?.geometry?.coordinates ?? null;

  const landing = jsonData.features.find((item: any) => item.id === 'land0');
  const landingTime = landing?.properties?.timestamp ?? null;
  const landingPos = landing?.geometry?.coordinates ?? null;

  const duration =
    landingTime && launchTime ? (landingTime - launchTime) / 1000 : 0;

  let maxAlt = 0;
  for (const fix of igcJson.fixes) {
    const alt =
      fix.pressureAltitude !== null ? fix.pressureAltitude : fix.gpsAltitude;
    if (alt !== null && alt > maxAlt) {
      maxAlt = alt;
    }
  }

  const meta: FlightMeta = {
    distance: xcDistance,
    duration,
    date: igcJson.date,
    glider: igcJson.gliderType,
    landing_date:
      landingTime === null ? null : new Date(landingTime).toISOString(),
    landing_pos: landingPos,
    landing_location: '',
    max_altitude: maxAlt,
    pilot: igcJson.pilot ?? null,
    copilot: igcJson.copilot ?? null,
    takeoff_date:
      launchTime === null ? null : new Date(launchTime).toISOString(),
    takeoff_pos: launchPos,
    takeoff_location: '',
    timezone: null,
    filename: '',
    filepath: null,
    numFlight: igcJson.numFlight,
    registration: igcJson.registration,
    callsign: igcJson.callsign,
    competitionClass: igcJson.competitionClass,
    loggerId: igcJson.loggerId,
    loggerManufacturer: igcJson.loggerManufacturer,
    xcDistance,
    xcScore,
    xcType,
    xcCode,
    sport: '',
    best_thermal_avg_vario: null,
    favorite: false,
  };
  return {
    fullData,
    jsonData,
    meta,
  };
};

expose(calcIgcOpt);
