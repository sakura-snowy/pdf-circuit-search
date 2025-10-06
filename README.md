# PDF电路图智能搜索系统

一个基于Web的PDF电路图文档智能搜索系统，支持关键词搜索、智能定位、相关度排序、同义词识别等功能。

## 🌟 功能特性

### 核心功能
- **📄 PDF文档展示**：支持多个PDF文件的列表展示和详情查看
- **🔍 智能搜索**：基于关键词的全文搜索功能
- **🎯 智能定位**：自动定位到PDF中所有包含关键词的位置
- **📊 相关度排序**：根据文本类型（标题、描述、表格、普通文本）智能排序搜索结果
- **⏭️ 结果导航**：提供"上一处"/"下一处"按钮，快速在搜索结果间跳转
- **🔄 PDF基础操作**：支持PDF的缩放、翻页、移动等基础功能

### 可选功能
- **🔤 同义词搜索**：支持元器件名称的中英文同义词识别
  - 示例：油门踏板 = 踏板位置传感器 = Accelerator Pedal Sensor = APS
  - 示例：挂车控制模块 = Trailer Control Module = TCM
- **💡 扩展性设计**：预留文档问答接口（可集成AI模型实现电路连接性问答）

## 🏗️ 系统架构

```
PDF电路图搜索系统
├── 前端 (Frontend)
│   ├── React 18 + TypeScript
│   ├── React-PDF (PDF.js)
│   ├── Ant Design UI
│   └── Axios
│
├── 后端 (Backend)
│   ├── Node.js + Express
│   ├── TypeScript
│   ├── pdf-parse (文本提取)
│   └── 内存索引（全文搜索）
│
└── 部署 (Deployment)
    ├── PM2 (进程管理)
    └── Nginx (反向代理)
```

## 🛠️ 技术栈

### 前端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| TypeScript | 5.9.3 | 类型安全 |
| React-PDF | 7.6.0 | PDF渲染 |
| Ant Design | 5.12.5 | UI组件库 |
| React Router | 6.21.1 | 路由管理 |
| Axios | 1.6.5 | HTTP客户端 |
| Vite | 7.1.7 | 构建工具 |

### 后端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.18.2 | Web框架 |
| TypeScript | 5.3.3 | 类型安全 |
| pdf-parse | 1.1.1 | PDF文本提取 |
| CORS | 2.8.5 | 跨域支持 |

### 部署环境
- **服务器**：腾讯云 CVM (4核4G3M)
- **操作系统**：Ubuntu/Linux
- **进程管理**：PM2
- **Web服务器**：Nginx
- **Node版本**：18 LTS

## 🚀 快速开始

### 本地开发

#### 前置要求
- Node.js 18+
- npm 或 yarn

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd PDF_text
```

#### 2. 安装后端依赖
```bash
cd backend
npm install
```

#### 3. 安装前端依赖
```bash
cd ../frontend
npm install --legacy-peer-deps
```

#### 4. 准备PDF文件
将PDF文件放置在项目根目录的 `pdfs/` 文件夹中

#### 5. 启动后端服务
```bash
cd backend
npm run dev
# 后端运行在 http://localhost:3001
```

#### 6. 启动前端服务
```bash
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

#### 7. 访问应用
在浏览器中打开 `http://localhost:5173`

## 📦 生产部署

### 方式一：使用自动化部署脚本

#### 1. 初始化服务器环境
```bash
# 在服务器上运行
bash setup-server.sh
```

#### 2. 配置部署脚本
编辑 `deploy.sh`，修改以下配置：
```bash
SERVER_IP="your_server_ip"      # 你的服务器IP
SERVER_USER="root"               # SSH用户名
```

#### 3. 配置Nginx
编辑 `nginx.conf`，修改域名：
```nginx
server_name your_domain.com;    # 替换为你的域名或IP
```

#### 4. 执行部署
```bash
bash deploy.sh
```

### 方式二：手动部署

#### 1. 构建前端
```bash
cd frontend
npm run build
# 构建产物在 frontend/dist/
```

#### 2. 构建后端
```bash
cd backend
npm run build
# 构建产物在 backend/dist/
```

#### 3. 上传文件到服务器
```bash
# 上传前端构建产物
scp -r frontend/dist/* user@server:/var/www/pdf-search/frontend/

# 上传后端构建产物和依赖
scp -r backend/dist user@server:/var/www/pdf-search/backend/
scp backend/package.json user@server:/var/www/pdf-search/backend/

# 上传PDF文件
scp -r pdfs/* user@server:/var/www/pdf-search/pdfs/
```

#### 4. 服务器端操作
```bash
# SSH登录服务器
ssh user@server

# 安装后端依赖
cd /var/www/pdf-search/backend
npm install --production

# 配置环境变量
cp .env.production .env

# 使用PM2启动后端
pm2 start dist/index.js --name pdf-search-backend
pm2 save
pm2 startup

# 配置Nginx
sudo cp nginx.conf /etc/nginx/sites-available/pdf-search
sudo ln -s /etc/nginx/sites-available/pdf-search /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📖 使用说明

### 浏览文档列表
1. 打开网站首页
2. 可以看到所有可用的PDF电路图文档
3. 使用搜索框可以过滤文档名称
4. 点击任意文档卡片进入详情页

### 搜索元器件
1. 在PDF详情页顶部搜索框输入关键词
   - 示例：`油门踏板`、`挂车控制模块`、`ECU`
2. 点击搜索按钮或按Enter键
3. 系统自动跳转到第一个匹配位置
4. 右侧显示所有搜索结果，按相关度排序

### 查看搜索结果
- **结果类型标签**：
  - 🔴 标题（相关度最高）
  - 🟠 描述
  - 🔵 表格
  - ⚪ 普通文本
- **相关度分数**：数值越高越相关
- **上下文预览**：显示匹配文本的上下文

### 在结果间导航
1. 使用"上一处"/"下一处"按钮在搜索结果间跳转
2. 或直接点击右侧搜索结果列表中的任意项
3. PDF自动滚动到对应页面

### PDF操作
- **缩放**：点击放大/缩小按钮或使用百分比调整
- **翻页**：使用上一页/下一页按钮
- **返回**：点击"返回列表"按钮回到文档列表

## 🔧 技术决策

### 1. 为什么选择 React-PDF？
- **优势**：
  - 基于成熟的 PDF.js 库
  - 良好的 React 集成
  - 支持文本层渲染（便于搜索高亮）
  - 轻量级，无需后端PDF转换

### 2. 为什么选择 pdf-parse？
- **优势**：
  - 纯JavaScript实现，无需系统依赖
  - 快速的文本提取性能
  - 简单易用的API
  - 支持中文文本提取

### 3. 为什么使用内存索引而非数据库？
- **考虑因素**：
  - PDF文档数量有限（4个文件）
  - 搜索性能要求高
  - 部署简单，无需额外数据库服务
  - 服务器重启时自动重建索引
- **优化**：使用缓存机制减少重复解析

### 4. 相关度算法设计
```typescript
相关度得分 = 基础分 + 文本类型分 + 匹配次数分 + 长度因子分

- 完全匹配：+100分
- 包含关键词：每次 +10分
- 标题类型：+50分
- 描述类型：+30分
- 表格类型：+20分
- 普通文本：+5分
- 短文本（<50字符）：+20分
```

### 5. 同义词实现方案
- **数据结构**：哈希表存储同义词组
- **匹配策略**：双向匹配（中文↔英文）
- **扩展性**：支持动态添加同义词
- **示例**：
```typescript
{
  '油门踏板': ['踏板位置传感器', 'Accelerator Pedal Sensor', 'APS'],
  'ECU': ['电控单元', 'Electronic Control Unit', '控制器']
}
```

## 📁 项目结构

```
PDF_text/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API调用
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── PDFListPage.tsx      # 文档列表页
│   │   │   └── PDFViewerPage.tsx    # PDF查看页
│   │   ├── types/           # TypeScript类型定义
│   │   └── App.tsx          # 根组件
│   ├── .env                 # 开发环境变量
│   ├── .env.production      # 生产环境变量
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   │   └── pdfService.ts        # PDF处理服务
│   │   ├── types/           # TypeScript类型定义
│   │   └── index.ts         # 入口文件
│   ├── .env                 # 开发环境变量
│   ├── .env.production      # 生产环境变量
│   └── package.json
│
├── pdfs/                    # PDF文件存储目录
│   ├── 412-DFH1180E3...pdf
│   ├── 江铃_福顺...pdf
│   ├── 陕汽_轩德翼3...pdf
│   └── 一汽解放_新款J6L...pdf
│
├── nginx.conf               # Nginx配置文件
├── deploy.sh                # 自动化部署脚本
├── setup-server.sh          # 服务器环境初始化脚本
└── README.md                # 项目文档
```

## 🔌 API文档

### 获取PDF列表
```
GET /api/pdfs
Response: {
  success: true,
  data: [
    {
      id: "base64_encoded_filename",
      filename: "xxx.pdf",
      filepath: "/path/to/file",
      size: 1234567
    }
  ]
}
```

### 获取PDF文件
```
GET /api/pdfs/:id/file
Response: PDF文件流
```

### 搜索PDF
```
GET /api/pdfs/:id/search?query=关键词
Response: {
  success: true,
  data: {
    documentId: "xxx",
    query: "油门踏板",
    results: [
      {
        page: 10,
        text: "油门踏板位置传感器",
        context: "...",
        relevanceScore: 85,
        type: "title"
      }
    ],
    totalMatches: 5
  }
}
```

## 🎯 性能优化

1. **PDF文本缓存**：首次提取后缓存，避免重复解析
2. **按需加载**：仅加载当前页面的PDF内容
3. **搜索优化**：使用正则表达式加速文本匹配
4. **Nginx静态资源缓存**：提升前端资源加载速度
5. **PM2集群模式**：可配置多进程提升并发能力

## 🐛 已知限制

1. **大PDF文件**：超过32MB的PDF无法通过前端Read工具预览（后端可正常处理）
2. **图片搜索**：不支持PDF中图片内文字的识别（仅支持文本层搜索）
3. **跨PDF搜索**：当前仅支持单个PDF内搜索
4. **实时高亮**：暂不支持PDF内关键词高亮显示

## 🔮 未来优化方向

- [ ] 支持PDF内关键词高亮显示
- [ ] 支持跨多个PDF文档的全局搜索
- [ ] 集成OCR识别PDF图片中的文字
- [ ] 接入AI模型实现智能问答功能
  - 示例："油门踏板连接到ECU的哪些针脚号？"
- [ ] 添加搜索历史记录
- [ ] 支持导出搜索结果
- [ ] 优化移动端体验

## 📝 License

MIT License

## 👥 作者

Generated with Claude Code

---

**项目状态**: ✅ 已完成核心功能，可投入生产使用

如有问题或建议，欢迎提交Issue！
