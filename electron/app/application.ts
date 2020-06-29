import { environment } from '../environments/environment';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { URL } from 'url';
import { showOpenFileDialog } from './dialog';
import { getImageFiles, getNextFolder } from './files';
import { ComicModeEnum } from '../config/type';
import * as rimraf from 'rimraf';
import { join } from 'path';

export class Application {
  readonly baseUrl: URL;

  instance: BrowserWindow;

  constructor() {
    global.data = { current: 0, images: [] };
    global.comicMode = ComicModeEnum.NORMAL;
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
    const instance = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
    });

    instance.loadURL(this.baseUrl.toString());

    instance.on('closed', () => {
      this.instance = null;
    });
    instance.on('close', () => {
      app.quit();
    });

    this.instance = instance;

    this.listen();
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
    ipcMain.on('openImage', this.openFileAndReply);
    ipcMain.on('switchFolder', this.switchFolder);
  }

  showWindow() {
    if (this.instance) {
      this.instance.show();
    } else {
      this.createWindow();
    }
  }

  private initMenu() {
    const template: any = [
      {
        label: 'comic viewer',
        submenu: [{ label: '退出', role: 'quit' }, { type: 'separator' }, { label: '关于', role: 'about' }],
      },
      {
        label: '文件',
        submenu: [
          {
            label: '打开',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.openFileAndSend();
            },
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
  }

  private openFileAndSend() {
    showOpenFileDialog().then((filepath) => {
      if (filepath) {
        getImageFiles(filepath).then((_) => this.instance.webContents.send('imageOpened', 'ok'));
      } else {
        this.instance.webContents.send('imageOpened', 'failed');
      }
    });
  }

  private openFileAndReply(event) {
    showOpenFileDialog().then((filepath) => {
      if (filepath) {
        getImageFiles(filepath).then((_) => event.reply('imageOpened', 'ok'));
      } else {
        event.reply('imageOpened', 'failed');
      }
    });
  }

  private switchFolder(event) {
    const folderPath = getNextFolder(global.data.images[0]);
    if (folderPath) {
      getImageFiles(folderPath).then((_) => event.reply('imageOpened', 'ok'));
    } else {
      event.reply('imageOpened', 'failed');
    }
  }
}
