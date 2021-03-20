import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { URL } from 'url';
import * as rimraf from 'rimraf';
import { join, basename } from 'path';
import { localStorage } from 'electron-browser-storage';

import { environment } from '../environments/environment';
import { getTitle } from './utils/titleUtil';
import { showOpenFileDialog } from './dialog';
import { getImageFiles, getNextFolder, getImageFilesFromZip } from './files';
import { isZipFile } from './files/filepath';
import { folderSwitchDirEnum } from './files/filepath';
import { ComicModeEnum } from '../config/type';
import { History } from '../data/data.interface';

export class Application {
  readonly baseUrl: URL;

  instance: BrowserWindow;

  constructor() {
    global.data = { current: 0, images: [] };
    localStorage.getItem('comic-mode').then(mode => {
      global.comicMode = mode || ComicModeEnum.VERTICAL;
    });
    this.baseUrl = new URL(environment.indexHtmlUrl);
  }

  init() {
    this.initMenu();
    this.start();
  }

  start() {
    this.createWindow();
  }

  createWindow() {
    (async () => {
      let size = await localStorage.getItem('window-size');
      size = JSON.parse(size || '{}');
      const { width = 800, height = 600 } = size;

      const instance = new BrowserWindow({
        width,
        height,
        titleBarStyle: 'default',
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
        },
      });

      instance.loadURL(this.baseUrl.toString());

      instance.on('close', () => {
        app.quit();
      });
      instance.on('closed', () => {
        this.instance = null;
      });
      instance.on('resize', () => {
        const size = instance.getSize();
        const [width, height] = size;
        localStorage.setItem('window-size', JSON.stringify({ width, height }));
      });

      this.instance = instance;

      this.listen();
    })();
  }

  activate() {
    if (BrowserWindow.getAllWindows().length > 0) {
      return;
    }
    this.start();
  }

  clear() {
    // 应用退出之前，清除application状态
    const tempDir = app.getPath('temp');
    const imageTempDir = join(tempDir, 'comic-viewer');
    rimraf.sync(imageTempDir);
  }

  listen() {
    ipcMain.on('openImage', event => this.openFileAndReply(event));
    ipcMain.on('switchNextFolder', (event, imageData) => this.switchNextFolder(event, imageData));
    ipcMain.on('switchPreviousFolder', (event, imageData) => this.switchPreviousFolder(event, imageData));
  }

  showWindow() {
    if (this.instance) {
      this.instance.show();
    } else {
      this.createWindow();
    }
  }

  private initMenu() {
    (async () => {
      // await localStorage.clear();
      const historyStr: string = await localStorage.getItem('history');
      const histories: History[] = JSON.parse(historyStr || '[]');
      const historiesMenu = histories.map(history => {
        return {
          label: history.menuName,
          click: () => {
            this.openFileByHistory(history);
          },
        };
      });

      const template: any = [
        // process.platform === 'darwin'
        {
          label: app.getName(),
          submenu: [{ label: '关于', role: 'about' }, { type: 'separator' }, { label: '退出', role: 'quit' }],
        },
        {
          label: '文件',
          submenu: [
            {
              label: '打开...',
              accelerator: 'CmdOrCtrl+O',
              click: () => {
                this.openFileAndSend();
              },
            },
            {
              label: '打开最近的文件',
              submenu: historiesMenu,
            },
          ],
        },
        {
          label: '窗口',
          submenu: [
            { label: '最小化', role: 'minimize' },
            { label: '缩放', role: 'zoom' },
            {
              label: '关闭',
              accelerator: 'CmdOrCtrl+W',
              click: () => {
                this.instance.hide();
              },
            },
          ],
        },
      ];

      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    })();
  }

  /**
   * 通过菜单历史记录打开文件
   * @param history
   */
  private openFileByHistory(history: History) {
    const { isZip, filepath, volumnIndex } = history;
    if (isZip) {
      getImageFilesFromZip(filepath, volumnIndex).then(_ => this.instance.webContents.send('imageOpened', 'ok'));
    } else {
      if (filepath) {
        getImageFiles(filepath).then(_ => this.instance.webContents.send('imageOpened', 'ok'));
      } else {
        this.instance.webContents.send('imageOpened', 'failed');
      }
    }
  }

  private openFile(onSuccess, onFail) {
    showOpenFileDialog().then(filepath => {
      if (filepath) {
        this.storeHistory(filepath);
        getImageFiles(filepath).then(onSuccess);
      } else {
        onFail();
      }
    });
  }

  private openFileAndSend() {
    this.openFile(
      _ => this.instance.webContents.send('imageOpened', 'ok'),
      () => this.instance.webContents.send('imageOpened', 'failed'),
    );
  }

  private openFileAndReply(event) {
    this.openFile(
      _ => event.reply('imageOpened', 'ok'),
      () => event.reply('imageOpened', 'failed'),
    );
  }

  private switchFolder(event, switchDir: folderSwitchDirEnum, imageData) {
    if (imageData.isZip) {
      getImageFilesFromZip(imageData.filepath, imageData.volumnIndex + switchDir).then(_ =>
        event.reply('imageOpened', 'ok'),
      );
      this.replaceZipHistory(imageData, imageData.volumnIndex + switchDir);
      return;
    }
    const folderPath = getNextFolder(global.data.images[0], switchDir);
    if (folderPath) {
      if (global.comicMode === ComicModeEnum.VERTICAL) {
        this.replaceHistory(folderPath);
      }
      getImageFiles(folderPath).then(_ => event.reply('imageOpened', 'ok'));
    } else {
      event.reply('imageOpened', 'failed');
    }
  }

  private switchPreviousFolder(event, imageData) {
    this.switchFolder(event, folderSwitchDirEnum.PREVIOUS, imageData);
  }

  private switchNextFolder(event, imageData) {
    this.switchFolder(event, folderSwitchDirEnum.NEXT, imageData);
  }

  private storeHistory(filepath) {
    const fileName = getTitle(filepath, global.comicMode);
    localStorage.getItem('history').then(historiesStr => {
      let histories: History[] = JSON.parse(historiesStr || '[]');
      const isZip = isZipFile(filepath);
      if (isZip) {
        histories.unshift({ isZip, filename: fileName, menuName: fileName, filepath, volumnIndex: 1 });
      } else {
        histories.unshift({ isZip, filename: fileName, menuName: fileName, filepath });
      }
      histories = histories.slice(0, 10);
      localStorage.setItem('history', JSON.stringify(histories));
    });
  }

  private replaceZipHistory(imageData, newVolumnIndex) {
    localStorage.getItem('history').then(historiesStr => {
      let histories: History[] = JSON.parse(historiesStr || '[]');
      const oldHistory = histories.shift();
      histories.unshift({ ...oldHistory, volumnIndex: newVolumnIndex });
      histories = histories.slice(0, 10);
      localStorage.setItem('history', JSON.stringify(histories));
    });
  }

  private replaceHistory(filepath) {
    const filename = basename(filepath);
    localStorage.getItem('history').then(historiesStr => {
      let histories: History[] = JSON.parse(historiesStr || '[]');
      histories.unshift({ filename, filepath });
      histories = histories.slice(0, 10);
      localStorage.setItem('history', JSON.stringify(histories));
    });
  }
}
