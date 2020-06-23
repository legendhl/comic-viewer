import { format } from 'url';
import { join } from 'path';

export const environment = {
  production: true,
  indexHtmlUrl: format({ pathname: join(__dirname, '../../app/index.html'), protocol: 'file:', slashes: true }),
};
