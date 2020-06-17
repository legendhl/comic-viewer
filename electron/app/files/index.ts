import * as fs from 'fs';
import * as path from 'path';
import { ImageData } from '../../data/data.interface';

export const supportFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.ico', '.bmp'];

function getFolderPath(filepath = '') {
  return path.dirname(filepath);
}

function getFileName(filepath = '') {
  return path.basename(filepath);
}

function getFileType(filepath = '') {
  return path.extname(filepath);
}

function isImage(file) {
  const fileType = getFileType(file).toLowerCase();
  return supportFileTypes.indexOf(fileType) >= 0;
}

function setGlobalData(imageData: ImageData) {
  global.data = imageData;
}

export function getImageFiles(filepath) {
  console.log(`filepath is ${filepath}`);
  const filename = getFileName(filepath);
  const folderPath = getFolderPath(filepath);
  const data: ImageData = {
    current: 0,
    images: [],
    // isDark: nativeTheme.shouldUseDarkColors, //设置主题模式
  };
  if (folderPath === '') {
    console.log('empty img');
    return data;
  }
  const files = fs.readdirSync(folderPath);
  if (files) {
    let i = 0;
    files.forEach((file) => {
      if (isImage(file)) {
        data.images.push(path.join(folderPath, file));
        if (filename === file) {
          data.current = i;
        }
        i++;
      }
    });
  }
  return data;
}
