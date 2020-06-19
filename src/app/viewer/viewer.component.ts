import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ipcRenderer, remote } from 'electron';
import { EventManager } from '@angular/platform-browser';
import { ImageData } from '../../../electron/data/data.interface';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnDestroy {
  @ViewChild('img') imgElement: ElementRef<HTMLImageElement>;
  showOpenFileBtn: boolean;
  imgSrc: string;

  private data: ImageData;
  private globalEventRemoversArr = [];

  constructor(private ref: ChangeDetectorRef, private eventManager: EventManager) {}

  ngOnInit(): void {
    this.showOpenFileBtn = true;
    ipcRenderer.on('imageOpened', (event, msg) => {
      if (msg === 'ok') {
        const data = remote.getGlobal('data');
        this.data = data;
        const { current, images } = data;
        if (images.length > 0) {
          this.showOpenFileBtn = false;
          this.setImage(images[current]);
          this.ref.detectChanges();
        } else {
          console.error('no image opened');
        }
      }
    });
    this.globalEventRemoversArr.push(
      this.eventManager.addGlobalEventListener('window', 'keydown', this.onKeyDown.bind(this)),
    );
  }

  ngOnDestroy(): void {
    this.globalEventRemoversArr.forEach((remover) => remover());
    this.globalEventRemoversArr = [];
  }

  openImage(): void {
    ipcRenderer.send('openImage');
  }

  private setImage(imageUrl: string): void {
    this.imgSrc = `file://${imageUrl}`;
  }

  previous(): void {
    if (!this.data) {
      return;
    }
    const { images } = this.data;
    const length = images.length;
    if (length > 0) {
      this.data.current = (this.data.current - 1 + length) % length;
      this.setImage(images[this.data.current]);
    } else {
      console.error('no image opened');
    }
  }

  next(): void {
    if (!this.data) {
      return;
    }
    const { images } = this.data;
    const length = images.length;
    if (length > 0) {
      this.data.current = (this.data.current + 1) % length;
      this.setImage(images[this.data.current]);
    } else {
      console.error('no image opened');
    }
  }

  maxWindow(): void {}
  resize(): void {
    const body = document.body;
    const { offsetWidth, offsetHeight } = body;
    const img = this.imgElement.nativeElement;
    const { offsetWidth: imgWidth, offsetHeight: imgHeight } = img;
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

  onKeyDown($event: KeyboardEvent): void {
    if ($event.shiftKey || $event.altKey || $event.metaKey || $event.ctrlKey) {
      return;
    }
    switch ($event.key) {
      case 'Home':
      case 'End':
        $event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        this.previous();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        this.next();
        break;
      default:
        return;
    }
  }
}
