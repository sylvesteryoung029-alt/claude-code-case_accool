# 已完成事项

> 格式：`[YYYY-MM-DD HH:MM] 完成内容`

[2026-06-05] 阶段 0：项目初始化 — 目录结构、Git、5 份标准文档、开发日志、CLAUDE.md
[2026-06-05] 阶段 1-3 合并 — 全部前端代码就绪（HTML/CSS/JS + 计算逻辑 + Win11 UI）
[2026-06-06] 从 Electron 迁移到 Neutralinojs v6.8.0：
  - 卸载 Electron (~190MB) / electron-builder
  - 安装 @neutralinojs/neu CLI（88 packages, 2 秒）
  - 重构目录结构为 resources/ 扁平布局
  - 更新窗口控制 API（Neutralino.window / Neutralino.app）
[2026-06-06] 阶段 4：打包完成（C# 自解压方案）
  - Neutralinojs embed-resources 在 Windows 存在兼容问题
  - 改用 C# 编译器 (csc.exe) 的 /resource 内嵌 + SFX launcher
  - 运行时自动提取到 %TEMP% 并启动
  - 输出单文件 AC-Cooling-Calculator.exe（1.75 MB）
  - 零外部依赖，Windows 11 自带 csc.exe
