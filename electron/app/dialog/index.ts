import { dialog } from 'electron';
import { supportImageFileTypes, supportZipFileTypes } from '../files';

export function showOpenFileDialog() {
  const supportFileTypes = [].concat(supportImageFileTypes, supportZipFileTypes);
  return dialog
    .showOpenDialog({
      title: '打开文件',
      defaultPath: '',
      properties: ['openFile', 'openDirectory'],
      filters: [{ name: 'Images', extensions: supportFileTypes }],
    })
    .then((result) => {
      if (result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
}
