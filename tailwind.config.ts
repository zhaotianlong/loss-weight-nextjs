import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 注意: preflight (base styles) 与 Ant Design 可能产生样式冲突，
  // 如需禁用请在项目级别自行处理（此处留空以适配当前 Tailwind 版本）

};
export default config;
