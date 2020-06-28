import { ImageData } from './data/data.interface';
import { ComicModeEnum } from './config/type';

declare global {
  namespace NodeJS {
    interface Global {
      data: ImageData;
      comicMode: ComicModeEnum;
    }
  }
}
