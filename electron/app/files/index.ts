import * as fs from 'fs';
import * as path from 'path';
import * as StreamZip from 'node-stream-zip';

import { ImageData } from '../../data/data.interface';
import { extractFiles } from './extract';
import {
  folderSwitchDirEnum,
  getFolderPath,
  getFileName,
  getFileType,
  isImage,
  isZipFile,
  isDirectory,
} from './filepath';

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
    const imageFiles = files.filter(file => isImage(file));
    const index = imageFiles.indexOf(filename);
    data.current = index < 0 ? 0 : index;
    data.images = imageFiles.map(file => path.join(folderPath, file));
  }
  setGlobalData(data);
  return Promise.resolve();
}

export async function getImageFilesFromZip(filepath: string, volumnIndex: number = 1): Promise<any> {
  const zip = new StreamZip.async({ file: filepath, storeEntries: true });
  const imageBuffer = [];
  const entries = await zip.entries('');
  const directories = [];
  const files = [];
  for (const entry of Object.values(entries)) {
    if (entry.name.startsWith('__MACOSX')) {
      continue;
    }
    if (entry.isDirectory) {
      directories.push(entry);
    } else if (entry.isFile) {
      files.push(entry);
    }
  }
  directories.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  if (volumnIndex >= directories.length) {
    volumnIndex = 0;
  }
  const curDir = directories[volumnIndex];
  const curDirName = curDir.name;
  const curFiles = files.filter(file => file.name.startsWith(curDirName));
  for (const entry of curFiles) {
    const buffer = await zip.entryData(entry);
    imageBuffer.push(buffer);
  }
  await zip.close();
  const data: ImageData = {
    current: 0,
    images: imageBuffer,
    folderName: curDir.name,
    volumnIndex,
    filepath,
    isZip: true,
  };
  setGlobalData(data);
  return Promise.resolve();
}

// TODO: return Promise<openFileInfo>
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

export function getNextFolder(filepath: string, switchDir: folderSwitchDirEnum): string {
  const folderPath = getFolderPath(filepath);
  const folderName = path.basename(folderPath);
  const parentFolder = getFolderPath(folderPath);

  const files = fs.readdirSync(parentFolder);
  const dirs = files.filter(file => isDirectory(path.join(parentFolder, file)));
  const length = dirs.length;
  const index = (dirs.indexOf(folderName) + switchDir + length) % length;
  return path.join(parentFolder, dirs[index]);
}
