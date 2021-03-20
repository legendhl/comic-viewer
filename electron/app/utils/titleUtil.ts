// import * as path from 'path';
const path = require('path')
import { ComicModeEnum } from '../../config/type';
import { isZipFile } from '../files/filepath';

/**
 * /a/b/c/d.zip => d
 * /a/b/c/d => d
 * /a/b/c/d.jpg => c/d
 * @param filepath 
 * @param comicMode 
 */
export function getTitle(filepath, comicMode) {
  const isZip = isZipFile(filepath);
  const extName = path.extname(filepath);
  const fileName = path.basename(filepath, extName);
  const dirName = path.dirname(filepath);
  const lastDirName = path.basename(dirName);
  if (isZip) {
    return fileName;
  } else if (comicMode === ComicModeEnum.NORMAL) {
    return fileName;
  } else if (comicMode === ComicModeEnum.VERTICAL) {
    return lastDirName;
  }
  return '';
}
