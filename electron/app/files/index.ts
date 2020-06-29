import * as fs from 'fs';
import * as path from 'path';
import { ImageData } from '../../data/data.interface';
import { extractFiles } from './extract';

export const supportImageFileTypes = ['jpg', 'jpeg', 'png', 'apng', 'gif', 'ico', 'bmp', 'webp'];
export const supportZipFileTypes = ['zip', 'rar', 'gz', '7z'];

function getFolderPath(filepath = '') {
  return path.dirname(filepath);
}

function getFileName(filepath = '') {
  return path.basename(filepath);
}

function getFileType(filepath = '') {
  return path.extname(filepath).toLowerCase().replace('.', '');
}

function isImage(file) {
  const fileType = getFileType(file);
  return supportImageFileTypes.indexOf(fileType) >= 0;
}

function isZipFile(file) {
  const fileType = getFileType(file);
  return supportZipFileTypes.indexOf(fileType) >= 0;
}

function isDirectory(filepath) {
  const stat = fs.lstatSync(filepath);
  return stat.isDirectory();
}

function setGlobalData(imageData: ImageData) {
  global.data = imageData;
}

function getImageFilesFromDir(folderPath: string, filename?: string): Promise<any> {
  const data: ImageData = {
    current: 0,
    images: [],
  };
  if (folderPath === '') {
    console.error('wrong folder');
    return;
  }
  const files = fs.readdirSync(folderPath);

  if (files) {
    const imageFiles = files.filter((file) => isImage(file));
    const index = imageFiles.indexOf(filename);
    data.current = index < 0 ? 0 : index;
    data.images = imageFiles.map((file) => path.join(folderPath, file));
  }
  setGlobalData(data);
  return Promise.resolve();
}

function getImageFilesFromZip(filepath: string): Promise<any> {
  return extractFiles(filepath)
    .then((imageTempDir) => getImageFilesFromDir(imageTempDir))
    .catch((err) => {
      console.error('UNZIP ERROR', err);
    });
}

export function getImageFiles(filepath: string): Promise<any> {
  if (isDirectory(filepath)) {
    return getImageFilesFromDir(filepath);
  } else {
    const filename = getFileName(filepath);
    const folderPath = getFolderPath(filepath);
    if (isZipFile(filename)) {
      return getImageFilesFromZip(filepath);
    } else {
      return getImageFilesFromDir(folderPath, filename);
    }
  }
}

export function getNextFolder(filepath: string): string {
  const folderPath = getFolderPath(filepath);
  const folderName = path.basename(folderPath);
  const parentFolder = getFolderPath(folderPath);

  const files = fs.readdirSync(parentFolder);
  const dirs = files.filter((file) => isDirectory(path.join(parentFolder, file)));
  const length = dirs.length;
  const index = (dirs.indexOf(folderName) + 1) % length;
  return path.join(parentFolder, dirs[index]);
}
