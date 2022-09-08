import { expose } from 'threads/worker';
import IgcParser from 'igc-parser';

const igcToJson = (data: string) => {
  const igcJson = IgcParser.parse(data, {
    lenient: true,
  });
  return igcJson;
};

expose(igcToJson);
