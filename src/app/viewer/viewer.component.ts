import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ipcRenderer, remote } from 'electron';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit {
  @ViewChild('img') imgElement: ElementRef<HTMLImageElement>;
  showOpenFileBtn: boolean;
  imgSrc: string;

  constructor(private ref: ChangeDetectorRef) {
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
          this.ref.detectChanges();
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
    console.log('previous');
  }

  next(): void {
    console.log('next');
  }

  maxWindow(): void {}
  resize(): void {
    // console.log(document.body, this.imgElement);
    const body = document.body;
    const { offsetWidth, offsetHeight } = body;
    // console.log(offsetWidth, offsetHeight);
    const img = this.imgElement.nativeElement;
    const { offsetWidth: imgWidth, offsetHeight: imgHeight } = img;
    // console.log(img, imgWidth, imgHeight);
    if (offsetWidth * imgHeight > imgWidth * offsetHeight) {
      // 窗口更宽
      img.style.transform = `scale(${offsetHeight / imgHeight})`;
    } else {
      // 图片更宽
      img.style.transform = `scale(${offsetWidth / imgWidth})`;
    }
  }
  resetSize(): void {}
  realSize(): void {}
  initParams(): void {}
  setWallpaper(): void {}
  changeTheme(): void {}
  doSomething(): void {}
}
