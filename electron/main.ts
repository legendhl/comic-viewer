const { app } = require('electron');
import { Application } from './app/application';

let application;
let appStart = true;

app.on('ready', () => {
  application = new Application();
  application.init();
});

// 当所有窗口都关闭的行为，windows 平台，所有窗口关闭后，应用关闭。 mac 系统，所有窗口关闭，主进程还会保留。
app.on('window-all-closed', () => {
  appStart = false;
});

// mac 系统，可能会在所有窗口关闭后，在此通过点击应用图标激活应用
app.on('activate', () => {
  if (appStart) {
    // 应用程序启动时，不响应activate事件
    return;
  }

  appStart = true;
  application.activate();
});

// GPU进程崩溃
app.on('gpu-process-crashed', (event) => {
  console.log(`event:${JSON.stringify(event)}`);
  console.log('GPU进程崩溃，程序退出');
});
