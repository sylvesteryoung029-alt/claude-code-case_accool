# 项目复盘：空调制冷量计算器开发 SOP

## 一、项目概述

| 项目 | 详情 |
|------|------|
| 目标 | Windows 11 桌面工具，输入房间参数，计算空调制冷量（kW + 匹） |
| 技术路径 | HTML/CSS/JS → 桌面化 → 打包单文件 .exe |
| 最终方案 | C# 自解压 + Chrome --app 无边框模式 |
| 最终体积 | **28 KB** |
| 开发耗时 | 1 天（含多次技术栈变迁） |

---

## 二、技术栈演化与放弃原因

### 第 1 代：Electron 34
| 维度 | 评估 |
|------|------|
| 体积 | ~190 MB |
| 启动 | ❌ `require("electron")` 返回路径字符串而非 API 对象 |
| 原因 | Electron 34 npm 包遮蔽内置模块，`electron/main` 在 ESM/CJS 模式下均无法解析 |
| 尝试次数 | 10+ 次 |
| 结论 | **放弃。** 模块解析机制不可靠，npm 下载二进制 190MB 易被杀毒软件拦截 |

### 第 2 代：Electron 28
| 维度 | 评估 |
|------|------|
| 体积 | ~190 MB |
| 启动 | ❌ 同样 `require("electron")` 返回字符串 |
| 原因 | 降级后问题依旧，说明不是版本问题，而是 npm 包本身的 `index.js` 遮蔽了运行时内置模块 |
| 结论 | **放弃。** 所有 Electron 版本的 npm 包都存在问题 |

### 第 3 代：Neutralinojs v6.8.0
| 维度 | 评估 |
|------|------|
| 体积 | ~1.7 MB |
| 安装 | ✅ npm install 88 packages, 2 秒 |
| 启动 | ❌ 显示 Neutralinojs 官网默认页，而非自定义页面 |
| 原因 | ① `resources.neu` 无法被运行时正确加载 ② `--load-dir-res` 直接文件模式也返回默认页 ③ 二进制代码显示配置解析失败后重定向到 `neutralino.js.org` |
| 尝试次数 | 15+ 次 |
| 结论 | **放弃。** Neutralinojs 的资源加载机制不稳定，在特定系统环境中无法工作 |

### 第 4 代：C# 自解压 + WebView2 Runtime
| 维度 | 评估 |
|------|------|
| 体积 | ~13 KB |
| 问题 | WebView2 Runtime (`msedgewebview2.exe`) 不支持 `--app` 无边框命令 |
| 发现方式 | 添加文件日志后发现 PID 正常但窗口不显示，`tasklist` 确认进程立即退出 |
| 结论 | **放弃。** WebView2 独立运行时设计用于嵌入场景，不支持命令行打开窗口 |

### 第 5 代：C# 自解压 + Chrome --app ✅
| 维度 | 评估 |
|------|------|
| 体积 | **28 KB** |
| 启动 | ✅ Chrome `--app` 无边框模式，窗口干净显示 |
| 原理 | 用户电脑有 Chrome（`D:\RunningCheeseChrome\`），C# 代码搜索已知路径 |
| 依赖 | Windows 自带 .NET Framework 4.x (csc.exe) + 用户已有的 Chrome |
| 结论 | **成功。** |

---

## 三、关键问题与解决方案

### 问题 1：Electron 模块解析失败
```
症状：TypeError: Cannot read properties of undefined (reading 'whenReady')
根因：require("electron") → 返回 "../node_modules/electron/dist/electron.exe"（字符串）
解决：放弃 Electron，换替代方案
```

### 问题 2：Neutralinojs resources.neu 不加载
```
症状：exe 启动后始终显示 neutralino.js.org 默认页面
根因：二进制代码 "resources.neu" → 配置解析失败 → 302 重定向到官网
排查：npx asar list resources.neu（确认结构正确）
      grep -a "neutralino.js.org" bin/neutralino-win_x64.exe（确认硬编码回退）
解决：放弃 Neutralinojs，换原生方案
```

### 问题 3：WebView2 Runtime 不支持 --app
```
症状：进程启动后立即退出，无窗口
根因：msedgewebview2.exe 是为 embedder 场景设计的，不支持独立 --app 命令
排查：在 C# 代码中添加文件日志，发现 PID 生成但窗口不显示
解决：换用完整的 Chrome 浏览器 --app 模式
```

### 问题 4：Chrome 不在 PATH 中
```
症状：Process.Start("chrome") 失败
根因：用户 Chrome 在 D:\RunningCheeseChrome\App\chrome.exe，不在系统 PATH
排查：tasklist → Get-Process chrome → Select Path
解决：C# 代码搜索已知路径列表 + File.Exists() 验证
```

### 问题 5：C# System.IO.Compression 运行时缺失
```
症状：ZipFile.ExtractToDirectory() 在部分机器上报错
根因：System.IO.Compression.FileSystem.dll 未随 Framework 分发到所有系统
解决：放弃 ZIP 方式，直接用 csc /resource 逐个嵌入文件
```

---

## 四、可复用 SOP：HTML 桌面工具打包指南

### 判断流程

```
你的项目是纯前端（不需要 Node.js 后端/文件系统访问）吗？
    │
    ├── 是 → 继续
    │
    └── 否 → 需要考虑 Electron / Tauri / WPF
         （但需注意 Electron 的模块解析问题）

用户电脑有 Chrome 或 Edge 吗？
    │
    ├── 是 → 方案 A：C# 自解压 + Chrome --app
    │        体积：~30 KB
    │        复杂度：低
    │
    └── 否 → 方案 B：C# 自解压 + 系统默认浏览器
              体积：~30 KB
              复杂度：低
              (窗口会有地址栏/标签)
```

### 方案 A 实施步骤（推荐）

#### Step 1：准备前端代码
```
资源目录（resources/）只放运行所需文件：
resources/
  ├── index.html  （入口）
  ├── style.css   （样式）
  └── app.js      （逻辑）
```
> 注意：去掉 Neutralino.js、Electron 等框架引用。直接用 `window.close()` 关闭窗口。

#### Step 2：编写 C# 自解压启动器

```csharp
using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;

class Launcher
{
    [STAThread]
    static void Main()
    {
        // 1. 提取资源到临时目录
        string dir = Path.Combine(Path.GetTempPath(), "YourAppName");
        try { if(Directory.Exists(dir)) Directory.Delete(dir,true); } catch{}
        Directory.CreateDirectory(dir);
        foreach(string n in Assembly.GetExecutingAssembly().GetManifestResourceNames())
        {
            string p = Path.Combine(dir, n);
            using(Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(n))
            using(FileStream f = new FileStream(p, FileMode.Create))
            { byte[] b = new byte[65536]; int k; while((k=s.Read(b,0,b.Length))>0) f.Write(b,0,k); }
        }

        // 2. 构建 file:// URL
        string url = "file:///" + Path.Combine(dir,"index.html").Replace("\\","/");

        // 3. 搜索 Chrome/Edge 并使用 --app 无边框模式
        string[] browsers = {
            @"D:\RunningCheeseChrome\App\chrome.exe",  // 自定义路径
            @"C:\Program Files\Google\Chrome\Application\chrome.exe",
            @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        };
        foreach (string exe in browsers)
        {
            if (!File.Exists(exe)) continue;
            try {
                Process.Start(new ProcessStartInfo {
                    FileName = exe,
                    Arguments = "--app=\"" + url + "\" --window-size=520,640",
                    UseShellExecute = false });
                return;
            } catch { }
        }

        // 4. 回退：系统默认浏览器
        Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
    }
}
```

#### Step 3：编译

```bash
# 参数说明：
# -target:winexe   : 无控制台窗口的 Windows 程序
# -resource:*.html : 嵌入资源（文件名 = 资源名）
C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe \
    -target:winexe \
    -resource:index.html \
    -resource:style.css \
    -resource:app.js \
    -out:YourApp.exe \
    launcher.cs
```

#### Step 4：测试

```bash
# 1. 在另一目录测试
mkdir C:\test && copy YourApp.exe C:\test\ && cd C:\test && YourApp.exe

# 2. 验证文件提取
ls %TEMP%\YourAppName\

# 3. 确认窗口正常显示
```

### 方案 B：不带 --app 的回退

如果用户没有 Chrome/Edge，直接用系统默认浏览器：

```csharp
// （同上提取代码）
string url = "file:///" + Path.Combine(dir,"index.html").Replace("\\","/");
Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
```

窗口会带浏览器工具栏，但功能完全正常。

---

## 五、调试技巧

### 1. C# 程序调试（无窗口时）

在 `Main()` 入口加文件日志：
```csharp
string log = @"C:\Users\Administrator\debug.log";
File.WriteAllText(log, "START\n");
// ... 每步操作后
File.AppendAllText(log, "step N: " + someVar + "\n");
```

### 2. 确认资源是否嵌入

```
# 查看嵌入资源列表
strings YourApp.exe | findstr "index.html"

# 或在代码中打印
string[] names = Assembly.GetExecutingAssembly().GetManifestResourceNames();
```

### 3. 确认浏览器路径

```bash
# 查看正在运行的浏览器进程路径
powershell -Command "Get-Process chrome | Select Path"

# 搜索安装位置
dir /s "C:\Program Files\chrome.exe"
dir /s "D:\*chrome.exe"
```

### 4. Neutralinojs 资源结构排查

```bash
# 列出 resources.neu 内文件
npx asar list resources.neu

# 提取查看配置
npx asar extract resources.neu _tmp && cat _tmp/neutralino.config.json
```

### 5. 进程启动与否排查

```bash
# 启动后立即检查
tasklist | findstr chrome
tasklist | findstr msedgewebview2
```

---

## 六、踩坑清单

| # | 坑 | 现象 | 解决方案 |
|------|------|------|------|
| 1 | Electron 模块遮蔽 | `require("electron")` → 字符串 | 放弃 Electron |
| 2 | Neutralinojs 资源加载 | 始终显示官网默认页 | 放弃 Neutralinojs |
| 3 | WebView2 不支持 --app | 进程立即退出无窗口 | 换完整 Chrome |
| 4 | Chrome 不在 PATH | `Process.Start("chrome")` 失败 | 搜索已知路径 |
| 5 | C# System.IO.Compression | 运行时 DLL 缺失 | 逐文件嵌入代替 ZIP |
| 6 | Bash 反斜杠被吃 | `\n` 变 `n` | 用 Write 工具直接写文件 |
| 7 | Windows Defender 锁文件 | `rm -rf node_modules` 失败 | 关掉进程，sleep 2 秒再删 |
| 8 | csc.exe 路径带空格 | 编译命令解析错误 | 用 `cmd /c` 或 PowerShell 包装 |
| 9 | 中文字符编码 | config.json 存入时损坏 | 用英文 JSON key，HTML 用 `<meta charset="utf-8">` |

---

## 七、最终项目结构

```
accool/
├── AC-Cooling-Calculator.exe   ← 最终 .exe（28 KB）
├── package.json                ← npm start / npm run build
├── resources/                  ← 源文件（编辑这里）
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── assets/icon.png
├── scripts/
│   └── build-sfx.js            ← 自动化 C# 编译脚本
├── docs/                       ← 5 份标准文档 + 本 SOP
├── devlog/                     ← 开发日志
└── CLAUDE.md                   ← 项目 AI 指引
```

## 八、重复使用指南

下次做类似的纯前端桌面工具：

1. **直接复制 `scripts/build-sfx.js`**——改资源文件名即可
2. **复制 C# 启动器模板**——改浏览器搜索路径和窗口尺寸
3. **跨过 Electron/Neutralinojs**——直接到 C# + 浏览器方案
4. **先检查用户电脑有哪些浏览器**——适配搜索路径列表
5. **开发时用 `npm start` 在浏览器调试**——最后才打包 .exe

整个流程从头到尾不超过 30 分钟。
