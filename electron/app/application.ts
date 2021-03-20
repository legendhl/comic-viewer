import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { URL } from 'url';
import * as rimraf from 'rimraf';
import { join, basename } from 'path';
import { localStorage } from 'electron-browser-storage';

import { environment } from '../environments/environment';
import { getTitle } from './utils/titleUtil';
import { showOpenFileDialog } from './dialog';
import { getImageFiles, getNextFolder, folderSwitchDirEnum, getImageFilesFromZip } from './files';
import { ComicModeEnum } from '../config/type';

export class Application {
  readonly baseUrl: URL;

  instance: BrowserWindow;

  constructor() {
    global.data = { current: 0, images: [] };
    localStorage.getItem('comic-mode').then(mode => {
      global.comicMode = mode || ComicModeEnum.NORMAL;
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
      let histories = await localStorage.getItem('history');
      histories = JSON.parse(histories || '[]');
      const historiesMenu = histories.map(history => {
        return {
          label: history.filename,
          click: () => {
            this.openFileByPathAndSend(history.filepath);
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

  private openFileByPathAndSend(filepath) {
    if (filepath) {
      getImageFiles(filepath).then(_ => this.instance.webContents.send('imageOpened', 'ok'));
    } else {
      this.instance.webContents.send('imageOpened', 'failed');
    }
  }

  private openFileAndSend() {
    showOpenFileDialog().then(filepath => {
      if (filepath) {
        getImageFiles(filepath).then(_ => this.instance.webContents.send('imageOpened', 'ok'));
      } else {
        this.instance.webContents.send('imageOpened', 'failed');
      }
    });
  }

  private openFileAndReply(event) {
    showOpenFileDialog().then(filepath => {
      if (filepath) {
        this.storeHistory(filepath);
        getImageFiles(filepath).then(_ => event.reply('imageOpened', 'ok'));
      } else {
        event.reply('imageOpened', 'failed');
      }
    });
  }

  private switchFolder(event, switchDir: folderSwitchDirEnum, imageData) {
    if (imageData.isZip) {
      getImageFilesFromZip(imageData.filepath, imageData.volumnIndex + switchDir).then(_ =>
        event.reply('imageOpened', 'ok'),
      );
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
    const filename = getTitle(filepath, global.comicMode);
    localStorage.getItem('history').then(historiesStr => {
      let histories = JSON.parse(historiesStr || '[]');
      histories.unshift({ filename, filepath });
      histories = histories.slice(0, 10);
      localStorage.setItem('history', JSON.stringify(histories));
    });
  }

  private replaceHistory(filepath) {
    const filename = basename(filepath);
    localStorage.getItem('history').then(historiesStr => {
      let histories = JSON.parse(historiesStr || '[]');
      histories.shift();
      histories.unshift({ filename, filepath });
      histories = histories.slice(0, 10);
      localStorage.setItem('history', JSON.stringify(histories));
    });
  }
}
