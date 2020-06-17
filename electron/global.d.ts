import { ImageData } from './data/data.interface';

declare global {
  namespace NodeJS {
    interface Global {
      data: ImageData;
    }
  }
}
