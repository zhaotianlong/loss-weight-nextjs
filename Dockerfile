# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# 设置构建时环境变量
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# 复制依赖定义文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# 设置运行时环境变量
ENV NODE_ENV=production

# 从构建阶段复制必要文件 (Next.js standalone mode)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露端口 (Next.js 默认 3000)
EXPOSE 3000

# 启动命令 (standalone 模式使用 server.js)
CMD ["node", "server.js"]
