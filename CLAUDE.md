# 空调制冷量计算器 — 项目指引

## 项目简介

一款 Windows 11 风格的桌面工具，帮助用户根据房间属性计算所需空调制冷量，输出 kW 和匹两种单位。基于 Neutralinojs 构建，打包为单个 .exe（仅 ~1.7MB）。

## 技术栈

- **Neutralinojs v6.8.0** — 轻量桌面框架（调用系统 WebView2，Win11 自带）
- **前端**：HTML + CSS + Vanilla JS
- **打包**：`neu build` → PowerShell ZIP → C# 自解压 (`csc.exe /resource`) → 单文件 .exe
- **运行时**：SFX 提取到 `%TEMP%`，PowerShell 解压，`--load-dir-res` 模式启动
- **窗口控制**：使用 `Neutralino.window` / `Neutralino.app` API

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
npm start                     # 启动应用（开发模式）
npm run build                 # 完整打包流程：neu build → C# 自解压 .exe
```

## 关键文件

| 文件 | 作用 |
|------|------|
| [neutralino.config.json](neutralino.config.json) | Neutralinojs 窗口/构建配置 |
| [resources/index.html](resources/index.html) | 主界面 |
| [resources/style.css](resources/style.css) | Win11 风格样式 |
| [resources/app.js](resources/app.js) | 计算引擎 + 交互 |
| [AC-Cooling-Calculator.exe](AC-Cooling-Calculator.exe) | 最终交付的便携 .exe |

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
| 阶段 1：项目骨架 | ✅ 完成 |
| 阶段 2：前端界面 | ✅ 完成 |
| 阶段 3：计算逻辑 | ✅ 完成 |
| 阶段 4：打包 | ✅ 完成 |
