import * as path from 'path';
import * as fs from 'fs';

export const supportImageFileTypes = ['jpg', 'jpeg', 'png', 'apng', 'gif', 'ico', 'bmp', 'webp'];
export const supportZipFileTypes = ['zip', 'rar', 'gz', '7z'];

export enum folderSwitchDirEnum {
  PREVIOUS = -1,
  NEXT = 1,
}

export function getFolderPath(filepath = '') {
  return path.dirname(filepath);
}

export function getFileName(filepath = '') {
  return path.basename(filepath);
}

export function getFileType(filepath = '') {
  return path
    .extname(filepath)
    .toLowerCase()
    .replace('.', '');
}

export function isImage(file) {
  const fileType = getFileType(file);
  return supportImageFileTypes.indexOf(fileType) >= 0;
}

export function isZipFile(file) {
  const fileType = getFileType(file);
  return supportZipFileTypes.indexOf(fileType) >= 0;
}

export function isDirectory(filepath) {
  const stat = fs.lstatSync(filepath);
  return stat.isDirectory();
}
