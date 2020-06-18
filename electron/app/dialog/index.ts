import { dialog } from 'electron';
import { supportFileTypes } from '../files';

export function showOpenFileDialog() {
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
