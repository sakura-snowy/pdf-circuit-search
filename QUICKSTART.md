# 快速开始指南

本指南帮助你在5分钟内启动PDF电路图搜索系统。

## 📋 前置要求

- Node.js 18+ ([下载](https://nodejs.org/))
- Git ([下载](https://git-scm.com/))
- 至少 4GB 可用内存（处理大PDF文件）

## 🚀 本地运行（开发模式）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/pdf-circuit-search.git
cd pdf-circuit-search
```

### 2. 安装依赖

**后端**:
```bash
cd backend
npm install
```

**前端**:
```bash
cd ../frontend
npm install --legacy-peer-deps
```

### 3. 准备PDF文件

将你的PDF文件放入 `pdfs/` 目录：

```bash
# 从项目根目录
mkdir -p pdfs
# 然后复制PDF文件到 pdfs/ 目录
```

### 4. 启动服务

**启动后端** (终端1):
```bash
cd backend
npm run dev
# 后端运行在: http://localhost:3001
```

**启动前端** (终端2):
```bash
cd frontend
npm run dev
# 前端运行在: http://localhost:5173
```

### 5. 访问应用

打开浏览器访问: **http://localhost:5173**

## 🎯 快速测试

1. **查看PDF列表**
   - 进入首页，应该能看到 `pdfs/` 目录下的所有PDF文件

2. **打开PDF**
   - 点击任意PDF卡片

3. **测试搜索**
   - 在搜索框输入: `油门踏板` 或其他关键词
   - 点击搜索按钮
   - 查看搜索结果并尝试跳转

4. **测试同义词**
   - 搜索 `APS` 应该也能找到"油门踏板"相关内容
   - 搜索 `Accelerator Pedal Sensor` 也应该有结果

## 🔧 常见问题

### Q: npm install 报错
**A**:
- 前端需要使用 `npm install --legacy-peer-deps`
- 确保Node.js版本 >= 18

### Q: PDF文件不显示
**A**:
- 检查PDF文件是否在 `pdfs/` 目录
- 检查后端日志是否有错误
- 确认后端 `.env` 中的 `PDF_STORAGE_PATH` 配置正确

### Q: 搜索无结果
**A**:
- 确保PDF包含文本层（不是纯图片扫描件）
- 检查关键词拼写是否正确
- 查看后端日志了解详细错误

### Q: 端口被占用
**A**:
修改配置文件中的端口号：
- 后端: `backend/.env` 中的 `PORT`
- 前端: 运行 `npm run dev -- --port 3000` 指定端口

## 📦 生产环境部署

详细部署指南请参考: [DEPLOY.md](./DEPLOY.md)

简化版部署（已有环境）：

```bash
# 1. 构建
cd frontend && npm run build
cd ../backend && npm run build

# 2. 启动
cd backend
pm2 start dist/index.js --name pdf-search

# 3. 配置Nginx（参考nginx.conf）
```

## 📚 更多资源

- 📖 [完整README](./README.md) - 详细功能说明和架构文档
- 🚀 [部署指南](./DEPLOY.md) - 生产环境部署完整流程
- 🐛 [问题反馈](https://github.com/your-username/pdf-circuit-search/issues)

## 💡 下一步

- 添加更多PDF文件到 `pdfs/` 目录
- 在 `backend/src/services/pdfService.ts` 中扩展同义词词典
- 根据需求定制UI界面
- 集成AI模型实现智能问答功能

---

🎉 开始使用吧！如有问题，欢迎提Issue。
