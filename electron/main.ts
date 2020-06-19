import { app } from 'electron';
import { Application } from './app/application';

try {
  let application;
  let appStart = true;

  // app.commandLine.appendSwitch('disable-web-security');

  // electron 完成初始化 ready 后，进行应用初始化
  app.on('ready', () => {
    // 打开开发者工具
    app.on('web-contents-created', (event, webContents) => {
      webContents.openDevTools({
        mode: 'detach',
      });
    });
    application = new Application();
    application.init();
  });

  // 当所有窗口都关闭的行为，windows 平台，所有窗口关闭后，应用关闭。 mac 系统，所有窗口关闭，主进程还会保留。
  app.on('window-all-closed', () => {
    appStart = false;
  });

  // 应用退出之前，清除application状态，目前仅包含24小时检查更新的interval
  app.on('before-quit', () => {
    application.clear();
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
    console.error(`event:${JSON.stringify(event)}`);
    console.error('GPU进程崩溃，程序退出');
  });
} catch (e) {
  console.error(e);
}
