import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ipcRenderer, remote } from 'electron';
import { EventManager, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageData } from '../../../electron/data/data.interface';
import { ComicModeEnum } from '../../../electron/config/type';
import { getTitle } from '../../../electron/app/utils/titleUtil';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnDestroy {
  @ViewChild('img') imgElement: ElementRef<HTMLImageElement>;
  @ViewChild('firstImg') firstImgElement: ElementRef<HTMLImageElement>;
  showOpenFileBtn: boolean;
  imgSrc: string;
  imgSrcs: (string | SafeResourceUrl)[];
  comicMode: ComicModeEnum;
  title: string;
  scale: number;

  private data: ImageData;
  private globalEventRemoversArr = [];

  constructor(private ref: ChangeDetectorRef, private eventManager: EventManager, private dom: DomSanitizer) {}

  ngOnInit(): void {
    this.showOpenFileBtn = true;
    const comicMode = remote.getGlobal('comicMode');
    this.setComicMode(comicMode);

    ipcRenderer.on('imageOpened', (event, msg) => {
      if (msg === 'ok') {
        const data = remote.getGlobal('data');
        this.data = data;
        const { current, images, folderName = '', volumnIndex, filepath, isZip } = data;
        if (images.length > 0) {
          this.showOpenFileBtn = false;
          if (this.comicMode === ComicModeEnum.NORMAL) {
            this.setImage(images[current]);
          } else {
            this.imgSrcs = [];
            if (isZip) {
              for (const img of images) {
                this.imgSrcs.push(this.getImage(img));
              }
              this.title = folderName
                .split('/')
                .filter((s) => !!s)
                .reverse()[0];
            } else {
              for (const img of images) {
                this.imgSrcs.push(this.formatImage(img));
              }
              this.title = getTitle(this.imgSrcs[0], this.comicMode);
            }
          }
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

  private setComicMode(comicMode: ComicModeEnum): void {
    switch (comicMode) {
      case ComicModeEnum.NORMAL:
        document.querySelector('body').style.cssText = 'height: 100%; overflow-y: hidden;';
        break;
      case ComicModeEnum.FOLIO:
        break;
      case ComicModeEnum.VERTICAL:
        document.querySelector('body').style.cssText = 'height: auto; overflow-y: scroll;';
        break;
      default:
        return;
    }
    this.comicMode = comicMode;
  }

  private formatImage(imageUrl: string): string {
    return `file://${imageUrl}`;
  }

  private getImage(buffer: Uint8Array, type?: string) {
    // TODO: type
    const url = URL.createObjectURL(new Blob([buffer.buffer], { type: 'image/png' }));
    return this.dom.bypassSecurityTrustResourceUrl(url);
  }

  private setImage(imageUrl: string): void {
    this.imgSrc = this.formatImage(imageUrl);
    this.title = getTitle(imageUrl, this.comicMode);
  }

  previous(): void {
    if (!this.data) {
      return;
    }
    if (this.comicMode === ComicModeEnum.VERTICAL) {
      ipcRenderer.send('switchPreviousFolder', this.data);
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
    if (this.comicMode === ComicModeEnum.VERTICAL) {
      ipcRenderer.send('switchNextFolder', this.data);
      return;
    }
    const { images, current } = this.data;
    const length = images.length;
    if (length > 0) {
      if (current + 1 < length) {
        this.data.current = (current + 1) % length;
        this.setImage(images[this.data.current]);
      } else {
        ipcRenderer.send('switchNextFolder');
      }
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
      this.scale = offsetHeight / imgHeight;
      // 窗口更宽
      img.style.transform = `scale(${this.scale})`;
    } else {
      this.scale = offsetWidth / imgWidth;
      // 图片更宽
      img.style.transform = `scale(${this.scale})`;
    }
  }

  onImageLoad(): void {
    const img = this.firstImgElement.nativeElement;
    const { naturalWidth, clientWidth } = img;
    this.scale = clientWidth / naturalWidth;
  }

  changeMode(): void {
    let newMode;
    if (this.comicMode === ComicModeEnum.NORMAL) {
      newMode = ComicModeEnum.VERTICAL;
    } else if (this.comicMode === ComicModeEnum.VERTICAL) {
      newMode = ComicModeEnum.NORMAL;
    }
    this.setComicMode(newMode);
    localStorage.setItem('comic-mode', newMode);
  }

  resetSize(): void {}
  realSize(): void {}
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
