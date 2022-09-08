import fs from 'fs-jetpack';

export async function findFiles(dir: string, matching: string = '*.igc') {
  try {
    let list = await fs.findAsync(dir, {
      matching,
      directories: false,
      files: true,
      recursive: true,
    });
    return list;
  } catch (error) {
    return [];
  }
}
