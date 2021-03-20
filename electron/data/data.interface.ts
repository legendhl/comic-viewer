export interface ImageData {
  current: number;
  images: string[];
  folderName?: string;
  volumnIndex?: number;
  filepath?: string;
  isZip?: boolean;
}

/**
 * /a/b/c/d.zip => d
 * /a/b/c/d => d
 * /a/b/c/d.jpg => c/d
 */
export interface History {
  menuName?: string; // 显示在菜单上的文件名
  isZip?: boolean;
  isDirectory?: boolean;
  filename: string; // 文件名
  folderName?: string; // 上级文件夹名
  filepath: string; // 完整路径
  index?: number;
  volumnIndex?: number;
  total?: number;
}
