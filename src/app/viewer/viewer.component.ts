import { Component, OnInit } from '@angular/core';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit {
  showOpenFileBtn: boolean;

  constructor() {}

  ngOnInit(): void {
    this.showOpenFileBtn = true;
  }

  openImage(): void {
    console.log('openImage');
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
