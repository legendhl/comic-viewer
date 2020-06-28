import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import * as rimraf from 'rimraf';
import { spawn } from 'child_process';
import * as prompt from 'electron-prompt';

export function extractFiles(filepath: string): Promise<any> {
  const tempDir = app.getPath('temp');
  const imageTempDir = path.join(tempDir, 'comic-viewer');

  rimraf.sync(imageTempDir);
  if (!fs.existsSync(imageTempDir)) {
    fs.mkdirSync(imageTempDir);
  }

  return new Promise((resolve, reject) => {
    const unzip = spawn('unzip', [filepath, '-d', imageTempDir]);
    unzip.stderr.on('data', (data) => {
      if (data.indexOf('password') >= 0) {
        prompt({
          title: '请输入密码',
          label: '密码：',
          value: '',
          inputAttrs: {
            type: 'password',
          },
          type: 'input',
        })
          .then((password) => {
            if (password === null) {
              reject();
            } else {
              const pwdUnzip = spawn('unzip', ['-P', password, filepath, '-d', imageTempDir]);
              pwdUnzip.stderr.on('data', () => {
                reject();
              });
              pwdUnzip.on('close', (code) => {
                code === 0 ? resolve(imageTempDir) : reject();
              });
            }
          })
          .catch(() => reject());
      } else {
        reject();
      }
    });
    unzip.on('close', (code) => {
      code === 0 ? resolve(imageTempDir) : reject();
    });
  });
}
