# 已完成事项

> 格式：`[YYYY-MM-DD HH:MM] 完成内容`

[2026-06-05] 阶段 0：项目初始化 — 目录结构、Git、5 份标准文档、开发日志、CLAUDE.md
[2026-06-05] 阶段 1-3 合并 — 全部前端代码就绪（HTML/CSS/JS + 计算逻辑 + Win11 UI）
[2026-06-06] 阶段 4：Edge App 模式最终方案
  - Electron（~190MB）→ Neutralinojs（~1.7MB，资源加载失败）
  - Neutralinojs → Edge WebView2 原生方案（~13KB）
  - 技术路径：C# 自解压 → Edge --app 模式
  - 去掉 Neutralinojs 全部依赖（node_modules、bin/、config.json）
  - 计算逻辑验证：4/4 测试用例通过
  - 输出 AC-Cooling-Calculator.exe（12.5 KB）
  - 零外部依赖：Windows 11 自带 Edge + .NET Framework
