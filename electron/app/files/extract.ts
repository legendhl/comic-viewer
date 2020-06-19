import * as fs from 'fs';
import * as path from 'path';
import * as JSZip from 'jszip';
import { app } from 'electron';

export function extractFiles(filepath: string): Promise<any> {
  const tempDir = app.getPath('temp');
  const imageTempDir = path.join(tempDir, 'comic-view');
  const imageCacheTempDir = path.join(imageTempDir, '__MACOSX');

  if (!fs.existsSync(imageTempDir)) {
    fs.mkdirSync(imageTempDir);
  }
  if (!fs.existsSync(imageCacheTempDir)) {
    fs.mkdirSync(imageCacheTempDir);
  }
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
    .then((data: Buffer) => JSZip.loadAsync(data))
    .then((zip) => extract(zip.files, imageTempDir))
    .then(() => imageTempDir);
}

function extract(files: { [key: string]: JSZip.JSZipObject }, saveDir: string): Promise<any> {
  return Promise.all(
    Object.keys(files).map((filename) => {
      const fileObj = files[filename];
      if (fileObj.dir) {
        // 忽略子文件夹
        return Promise.resolve();
      }
      const fullpath = path.join(saveDir, filename);
      // nodebuffer: the result will be a nodejs Buffer. This requires nodejs.
      return fileObj.async('nodebuffer').then(
        (content) =>
          new Promise((resolve, reject) => {
            fs.writeFile(fullpath, content, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }),
      );
    }),
  );
}
