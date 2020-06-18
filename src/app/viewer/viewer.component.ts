import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ipcRenderer, remote } from 'electron';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerComponent implements OnInit {
  showOpenFileBtn: boolean;
  imgSrc: string;

  constructor() {
  }

  ngOnInit(): void {
    this.showOpenFileBtn = true;
    ipcRenderer.on('imageOpened', (event, msg) => {
      if (msg === 'ok') {
        const data = remote.getGlobal('data');
        const { current, images } = data;
        if (images.length > 0) {
          this.showOpenFileBtn = false;
          this.imgSrc = `file://${images[current]}`;
        } else {
          console.log('no image opened');
        }
      }
    });
  }

  openImage(): void {
    ipcRenderer.send('openImage');
  }

  previous(): void {
    //
  }

  next(): void {
    //
  }

  maxWindow(): void {}
  resize(): void {}
  resetSize(): void {}
  realSize(): void {}
  initParams(): void {}
  setWallpaper(): void {}
  changeTheme(): void {}
  doSomething(): void {}
}
