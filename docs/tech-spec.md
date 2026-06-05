# 技术方案说明

## 技术选型

| 层级 | 选型 | 版本 | 理由 |
|------|------|------|------|
| 桌面壳 | Electron | ^34.0.0 | 成熟稳定，HTML/CSS/JS 生态 |
| 前端 | Vanilla HTML/CSS/JS | — | 零依赖，无需构建工具 |
| 打包 | electron-builder | ^25.0.0 | 输出 portable .exe |
| 玻璃效果 | CSS `backdrop-filter` | — | 原生 CSS，无需调用 Win32 API |

## 项目结构

```
ac-cooling-calculator/
├── CLAUDE.md                # AI 助手项目指引
├── .gitignore               # Git 忽略规则
├── package.json             # Electron 项目配置
├── main.js                  # Electron 主进程
├── preload.js               # 预加载脚本（安全桥接）
├── renderer/
│   ├── index.html           # 主界面（表单 + 结果卡片）
│   ├── style.css            # Win11 风格样式
│   └── app.js               # 计算逻辑 + DOM 交互
├── assets/
│   └── icon.png             # 应用图标（256x256）
├── docs/                    # 项目标准文件
│   ├── requirements.md      # 需求规格说明书
│   ├── tech-spec.md         # 本文件
│   ├── design-spec.md       # UI/UX 设计规范
│   ├── calculation-logic.md # 计算公式与参数说明
│   └── implementation-steps.md  # 分步执行计划
└── devlog/                  # 开发日志
    ├── completed.md         # 已完成事项
    └── todo.md              # 待办事项
```

## Electron 主进程配置

### 窗口参数

| 参数 | 值 |
|------|-----|
| 宽度 | 520px |
| 高度 | 640px |
| 可调整大小 | 否（固定尺寸） |
| 边框 | 无边框（frameless） |
| 圆角 | 通过 CSS `border-radius: 12px` 实现 |
| 背景 | 透明（transparent），由 CSS 渲染 |
| 标题栏 | 自定义（可拖拽区域） |

### 安全配置

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- 预加载脚本仅暴露必要的 API

## 打包配置（electron-builder）

```yaml
appId: com.accool.calculator
productName: 空调制冷量计算器
directories:
  output: dist
win:
  target: portable
  icon: assets/icon.png
portable:
  artifactName: AC-Cooling-Calculator.exe
```

## 依赖清单

### 生产依赖
无（前端全部使用原生 API）

### 开发依赖
- `electron`: ^34.0.0 — 桌面运行时
- `electron-builder`: ^25.0.0 — 打包工具
