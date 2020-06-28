import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';
import { app } from 'electron';
import * as rimraf from 'rimraf';

export function extractFiles(filepath: string): Promise<any> {
  const tempDir = app.getPath('temp');
  const imageTempDir = path.join(tempDir, 'comic-viewer');
  const imageCacheTempDir = path.join(imageTempDir, '__MACOSX');

  rimraf.sync(imageTempDir);
  if (!fs.existsSync(imageTempDir)) {
    fs.mkdirSync(imageTempDir);
  }
  if (!fs.existsSync(imageCacheTempDir)) {
    fs.mkdirSync(imageCacheTempDir);
  }
  return fs
    .createReadStream(filepath)
    .pipe(unzipper.Extract({ path: imageTempDir }))
    .promise()
    .catch((e) => {})
    .then(() => imageTempDir);
}
