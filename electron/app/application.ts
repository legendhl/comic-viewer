import { environment } from '../environments/environment';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { URL } from 'url';
import { showOpenFileDialog } from './dialog';
import { getImageFiles } from './files';

export class Application {
  readonly baseUrl: URL;

  instance: BrowserWindow;

  constructor() {
    global.data = { current: 0, images: [] };
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
  }

  listen() {
    ipcMain.on('openImage', this.openFileAndReply);
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
        label: '看看',
        submenu: [
          {
            label: '退出', // 'exit',
            accelerator: 'Esc',
            click: () => {
              app.quit();
            },
          },
          { type: 'separator' },
          {
            label: '关于', // 'about',
            click: () => {
              app.showAboutPanel();
            },
          },
        ],
      },
      {
        label: '文件', // 'file',
        submenu: [
          {
            label: '打开', // 'open',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              // showOpenFileDialog().then((success) => {
              //   if (success) {
              //     createWindow();
              //   }
              // });
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
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
}
