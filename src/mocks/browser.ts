// MSW 初始化文件。请在项目中安装 msw（dev dependency）并运行：
// npx msw init public/ --save
// 该命令会在 public/ 下生成 mockServiceWorker.js（浏览器所需的 service worker 文件）
import { setupWorker } from 'msw';
import { handlers } from './handlers/index';

export const worker = setupWorker(...handlers);
export default worker;
