# 空调制冷量计算器 — 项目指引

## 项目简介

一款 Windows 11 风格的桌面工具，帮助用户根据房间属性计算所需空调制冷量，输出 kW 和匹两种单位。基于 Electron 28 构建，打包为单个 .exe。

## 技术栈

- **Electron 28** + ESM (`"type": "module"`)
- **主进程**：`import electron from "electron/main"`（ESM 语法）
- **预加载**：`require("electron/renderer")`（CJS，`.cjs` 扩展名）
- **关键约定**：npm `electron` 包被重命名为 `node_modules/.electron-pkg/` 以免遮蔽 Electron 内置模块

## 标准文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 需求说明书 | [docs/requirements.md](docs/requirements.md) | 功能需求、非功能需求、验收标准 |
| 技术方案 | [docs/tech-spec.md](docs/tech-spec.md) | 技术选型、项目结构、依赖清单 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 颜色、尺寸、字体、动效精确数值 |
| 计算逻辑 | [docs/calculation-logic.md](docs/calculation-logic.md) | 公式、系数表、示例计算、边界处理 |
| 执行计划 | [docs/implementation-steps.md](docs/implementation-steps.md) | 分阶段步骤 |

## 开发日志

| 文件 | 路径 | 说明 |
|------|------|------|
| 已完成 | [devlog/completed.md](devlog/completed.md) | 已完成事项 |
| 待办 | [devlog/todo.md](devlog/todo.md) | 当前待办 |

## 快速命令

```bash
npm start          # 启动应用（开发模式）
npm run build      # 打包为 .exe
```

## 启动说明

由于 npm `electron` 包的 index.js 会遮蔽 Electron 运行时的内置模块，本项目的 `node_modules/electron` 被重命名为 `node_modules/.electron-pkg/`。`npm start` 脚本直接调用 `.electron-pkg/dist/electron.exe` 启动。

打包时需先恢复目录名：
```bash
mv node_modules/.electron-pkg node_modules/electron && npm run build
```

## 关键常量（禁止随意修改）

```
基础冷负荷: 120 W/m²
窗户热负荷: 200 W/m²
人体散热: 150 W/人
1匹: 2500 W
```

## 当前状态

| 阶段 | 状态 |
|------|------|
| 阶段 0：项目初始化 | ✅ 完成 |
| 阶段 1：Electron 骨架 | ✅ 完成 |
| 阶段 2：前端界面 | ✅ 完成 |
| 阶段 3：计算逻辑 | ✅ 完成 |
| 阶段 4：打包 | ⏳ 待开始 |
