import { app, BrowserWindow, ipcMain, Menu, nativeTheme, dialog, screen } from 'electron';
import { URL } from 'url';
import * as fs from 'fs';
// import * as path from 'path';
// const supportFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.ico', '.bmp'];
// const environment = { production: false };
// let inputFile = '';

// ---------------------------------
// function getInputFile() {
//   return inputFile;
// }

// function getPath(filepath = '') {
//   return path.dirname(filepath);
// }

// function getFileName(filepath = '') {
//   return path.basename(filepath);
// }

// function getFileType(filepath = '') {
//   return path.extname(filepath);
// }

// function isImage(file) {
//   let fileType = getFileType(file).toLowerCase();
//   return supportFileTypes.indexOf(fileType) >= 0;
// }

// function setGlobalData() {
//   global.data.push(getImgs(getInputFile()));
// }

// function resetGlobalData(id) {
//   global.data[id] = getImgs(getInputFile());
// }

// function getImgs(imgFile) {
//   console.log(`imgFile is ${imgFile}`);
//   const filename = getFileName(imgFile);
//   const folderPath = getPath(imgFile);
//   const imgsData = {
//     current: 0,
//     imgs: [],
//     isDark: nativeTheme.shouldUseDarkColors, //设置主题模式
//   };
//   console.log('isDark:', imgsData.isDark);
//   if (folderPath == '') {
//     console.log('empty img');
//     return imgsData;
//   }
//   const files = fs.readdirSync(folderPath);
//   if (files) {
//     // if (err) {
//     //   console.log('open file:' + folderPath + ' failed');
//     //   return imgsData;
//     // }
//     let i = 0;
//     files.forEach((file) => {
//       if (isImage(file)) {
//         fileFull = `${folderPath}/${file}`;
//         // console.log(fileFull);
//         imgsData.imgs.push(fileFull);
//         if (filename == file) {
//           imgsData.current = i;
//         }
//         i++;
//       }
//     });
//   }
//   return imgsData;
// }

// //打开图片后操作
// ipcMain.on('openImage', (event, id) => {
//   console.log('call back from renderer:');
//   showOpenFileDialog().then((success) => {
//     if (success) {
//       resetGlobalData(id);
//       event.reply('imageOpened', 'ok');
//     } else {
//       event.reply('imageOpened', 'failed');
//     }
//   });
// });

// function showOpenFileDialog() {
//   return dialog
//     .showOpenDialog({
//       title: '打开文件',
//       defaultPath: '',
//       properties: ['openFile'],
//       filters: [{ name: 'Img', extensions: supportFileTypes }],
//     })
//     .then((result) => {
//       if (result.filePaths.length > 0) {
//         inputFile = result.filePaths[0];
//         return true;
//       }
//       return false;
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }
// ---------------------------------

function initMenu() {
  const template: any = [
    {
      label: '看看',
      submenu: [
        {
          label: '退出', //'exit',
          accelerator: 'Esc',
          click: () => {
            app.quit();
          },
        },
        { type: 'separator' },
        {
          label: '关于', //'about',
          click: () => {
            app.showAboutPanel();
          },
        },
      ],
    },
    {
      label: '文件', //'file',
      submenu: [
        {
          label: '打开', //'open',
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

export class Application {
  readonly baseUrl: URL;

  constructor() {
    // global.data = [];
    this.baseUrl = new URL('http://localhost:4200');
  }

  init() {
    initMenu();
    this.start();
  }

  start() {
    this.createWindow();
  }

  createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    //   setGlobalData();

    win.loadURL(this.baseUrl.toString());

    // 打开开发者工具
    if (process.argv.includes('-t')) {
      win.webContents.openDevTools();
    }
  }

  activate() {
    if (BrowserWindow.getAllWindows().length > 0) {
      return;
    }
    this.start();
  }
}
