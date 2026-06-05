# 分步执行计划

## 阶段概览

| 阶段 | 内容 | 文件 | 依赖 |
|------|------|------|------|
| 0 | 项目初始化 | 目录、Git、文档 | — |
| 1 | Electron 骨架 | package.json, main.js, preload.js | 阶段 0 |
| 2 | 前端界面 | index.html, style.css | 阶段 1 |
| 3 | 计算逻辑 | app.js | 阶段 2 |
| 4 | 打包 | electron-builder 配置 | 阶段 3 |

---

## 阶段 0：项目初始化 ✅

### 0.1 创建目录结构
- 创建项目根目录及所有子目录
- 路径：`C:/Users/Administrator/ac-cooling-calculator/`

### 0.2 初始化 Git
- `git init`
- 编写 `.gitignore`

### 0.3 编写标准文档
- `docs/requirements.md` — 需求规格说明书
- `docs/tech-spec.md` — 技术方案说明
- `docs/design-spec.md` — UI/UX 设计规范
- `docs/calculation-logic.md` — 计算公式与参数
- `docs/implementation-steps.md` — 本文件

### 0.4 初始化开发日志
- `devlog/completed.md` — 已完成事项
- `devlog/todo.md` — 待办事项

### 0.5 编写 CLAUDE.md
- 项目指引文件，指向所有标准文档

---

## 阶段 1：Electron 项目骨架

### 1.1 编写 package.json
- 项目名称、版本、入口文件
- 开发依赖：electron
- npm scripts：start, build

### 1.2 安装依赖
```bash
npm install
```

### 1.3 编写 main.js
- 创建 BrowserWindow（无边框、透明背景、固定尺寸）
- 加载 renderer/index.html
- 窗口拖拽支持（通过 CSS `-webkit-app-region: drag`）

### 1.4 编写 preload.js
- contextBridge 暴露安全 API（如需要）

### 1.5 验证
- `npm start` 能打开空白无边框窗口
- 窗口尺寸 520×640
- 可通过拖拽标题栏移动窗口

---

## 阶段 2：前端界面

### 2.1 编写 index.html
- 表单控件（下拉 × 2、数字输入 × 4、复选框 × 1）
- 计算按钮
- 结果展示区域

### 2.2 编写 style.css
- 窗口全局样式（圆角、背景透明、毛玻璃）
- 表单布局
- 控件样式（输入框、下拉框、按钮）
- 结果卡片样式
- 动效

### 2.3 验证
- 界面视觉效果与设计规范一致
- 控件可交互（输入、选择、勾选）
- 按钮有悬停效果

---

## 阶段 3：计算逻辑 + 交互

### 3.1 编写 app.js — 数据部分
- 城市-气候系数映射表
- 朝向系数映射表
- 楼层系数判断逻辑

### 3.2 编写 app.js — 计算函数
- `calculate(area, windowArea, city, floor, isTopFloor, orientation, people)`
- 返回 `{ kw, hp }`

### 3.3 编写 app.js — 交互绑定
- 按钮点击事件
- 读取表单值 → 调用计算 → 更新 DOM 显示结果
- 输入校验（空值、负数、异常值）

### 3.4 验证
- 输入广州/20/3/5/非顶/南/2 人 → 预期 3.9kW / 1.6匹
- 切换顶层 → 制冷量上升
- 切换哈尔滨 → 制冷量下降
- 边界测试（空值提示）

---

## 阶段 4：打包

### 4.1 安装 electron-builder
```bash
npm install --save-dev electron-builder
```

### 4.2 配置 package.json
- 添加 build 字段（portable 配置）

### 4.3 准备图标
- 创建/放置 256×256 icon.png
- 或生成简单占位图标

### 4.4 打包
```bash
npm run build
```

### 4.5 验证
- 检查 dist/ 目录生成 .exe 文件
- 双击 .exe，确认可正常运行
- 复制到其他路径测试
