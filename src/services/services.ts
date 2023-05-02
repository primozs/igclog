import axios from 'axios';
import IgcParser from 'igc-parser';
import chalk from 'chalk';
import { getConfig, setConfig } from '../config';

type LatLon = {
  longitude: number;
  latitude: number;
};

const baseUrl = 'https://pgc.api.pwfc.cloud';
let accessToken = '';

const getAccessToken = async () => {
  try {
    if (!accessToken) {
      const data = await getConfig();
      const authJwt = await authenticateJwt(data?.accessToken || '');

      if (authJwt) {
        accessToken = data?.accessToken || ('' as string);
      }
    }
    return accessToken;
  } catch (error) {
    return null;
  }
};

export const authenticateLocal = async (
  username?: string,
  password?: string,
) => {
  try {
    if (!username || !password) {
      console.error('%s No username or password ', chalk.red.bold('ERROR'));
    }

    const url = `${baseUrl}/authentication`;
    const payload = {
      strategy: 'local',
      email: username,
      password: password,
    };

    const { data } = await axios.post(url, payload);

    await setConfig({
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error('%s Authentication failed ', chalk.red.bold('ERROR'));
  }
};

export const authenticateJwt = async (jwt?: string | null) => {
  try {
    if (!jwt) {
      console.error('%s No jwt ', chalk.red.bold('ERROR'));
    }

    const url = `${baseUrl}/authentication`;
    const payload = {
      strategy: 'jwt',
      accessToken: jwt,
      password: 'susa',
    };

    const { data } = await axios.post(url, payload);
    return data;
  } catch (error) {
    console.error('%s Authentication failed ', chalk.red.bold('ERROR'));

    await setConfig({
      accessToken: '',
    });
    return null;
  }
};

export const getTimezone = async (pos: number[], dtIso: string | null) => {
  try {
    const url = `${baseUrl}/timezone`;

    const { data: timezone } = await axios.post<{ gmt_offset: number | null }>(
      url,
      {
        lat: pos[1],
        lon: pos[0],
        ...(dtIso && { ref_iso_date: new Date(dtIso).toISOString() }),
      },
    );
    const utc = timezone.gmt_offset !== undefined ? timezone.gmt_offset : null;
    return utc;
  } catch (error) {
    return null;
  }
};

export const getLocation = async (pos: number[]) => {
  try {
    const url = `${baseUrl}/locations`;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return null;
    }

    const { data } = await axios.post<{ name: string | null }>(
      url,
      {
        position: pos,
      },
      {
        headers: {
          Authorization: `JWT ${accessToken}`,
        },
      },
    );

    const location = data ? data.name || '' : '';
    return location;
  } catch (error) {
    return null;
  }
};

export const getElevations = async (igcJson: IgcParser.IGCFile) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return null;
    }

    const url = `${baseUrl}/elevations`;
    let gndJson: number[] = [];

    const locations = getIgcLocations(igcJson);
    let res = [];

    for (const locArr of locations) {
      const { data } = await axios.post<number[]>(url, locArr, {
        headers: {
          Authorization: `JWT ${accessToken}`,
        },
      });
      res.push(data);
    }

    gndJson = gndJson.concat(...res);

    const jsonString = JSON.stringify(gndJson);
    return jsonString;
  } catch (error) {
    return null;
  }
};

const getIgcLocations = (igcJson: IgcParser.IGCFile) => {
  let ll: LatLon[][] = [];
  let l: LatLon[] = [];

  const size = 200;
  let ii = 0;

  for (let i = 0, len = igcJson.fixes.length; i < len; i++) {
    const { latitude, longitude } = igcJson.fixes[i];
    if (ii < size) {
      l.push({ latitude, longitude });
    } else {
      ii = 0;
      ll.push([...l]);
      l = [];
      l.push({ latitude, longitude });
    }

    if (i + 1 === len) {
      ll.push([...l]);
    }

    ii++;
  }

  return ll;
};
