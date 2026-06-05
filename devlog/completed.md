# 已完成事项

> 格式：`[YYYY-MM-DD HH:MM] 完成内容`

[2026-06-05] 阶段 0：项目初始化 — 目录结构、Git、5 份标准文档、开发日志、CLAUDE.md
[2026-06-05] 阶段 1-3 合并 — 全部前端代码就绪（HTML/CSS/JS + 计算逻辑 + Win11 UI）
[2026-06-06] 从 Electron 迁移到 Neutralinojs v6.8.0：
  - 卸载 Electron (~190MB) / electron-builder
  - 安装 @neutralinojs/neu CLI（88 packages, 2 秒）
  - 创建 neutralino.config.json（无边框、520×640、透明背景）
  - 更新 index.html 引入 neutralino.js 客户端库
  - 更新 app.js 窗口控制 API（Neutralino.window / Neutralino.app）
  - 更新 style.css 拖拽区域适配
  - 开发模式启动验证通过
[2026-06-06] 阶段 4：打包完成
  - 使用 npx neu build --embed-resources
  - 输出单文件 AC-Cooling-Calculator.exe（1.73 MB）
  - 资源已内嵌，独立运行无需外部文件
  - 相比 Electron 方案体积缩小 ~100 倍
