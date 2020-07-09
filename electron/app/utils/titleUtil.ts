import { ComicModeEnum } from '../../config/type';
const path = require('path');

export function getTitle(filepath, comicMode) {
  if (comicMode === ComicModeEnum.NORMAL) {
    return path.basename(filepath);
  } else if (comicMode === ComicModeEnum.VERTICAL) {
    return path.basename(path.dirname(filepath));
  }
  return '';
}
