/**
 * 空调制冷量计算器 — Edge App 模式打包脚本
 *
 * 将网页资源嵌入 C# 启动器，运行时用 msedge --app 打开
 * 依赖：Windows 11 自带 Edge + .NET Framework 4.x (csc.exe)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "dist", "build");
const CSC = "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe";

console.log("📦 准备项目资源...");
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });

// 复制 web 资源到构建目录
const files = ["index.html", "style.css", "app.js"];
files.forEach(f => {
  fs.copyFileSync(path.join(ROOT, "resources", f), path.join(BUILD, f));
});

// 复制图标
const assetsDir = path.join(BUILD, "assets");
fs.mkdirSync(assetsDir, { recursive: true });
const iconSrc = path.join(ROOT, "resources", "assets", "icon.png");
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(assetsDir, "icon.png"));
}

// 压缩为 ZIP
console.log("🗜️  压缩资源...");
execSync(
  'powershell -Command "Compress-Archive -Path index.html,style.css,app.js,assets -DestinationPath payload.zip -Force"',
  { cwd: BUILD, stdio: "pipe" }
);

// 写入 C# 源码
fs.writeFileSync(path.join(BUILD, "launcher.cs"), `using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;

class Launcher
{
    [STAThread]
    static void Main()
    {
        try
        {
            string dir = Path.Combine(Path.GetTempPath(), "AC_Cooling_Calc");
            if (Directory.Exists(dir))
                try { Directory.Delete(dir, true); } catch { }
            Directory.CreateDirectory(dir);

            string zipPath = Path.Combine(dir, "payload.zip");
            ExtractRes("payload.zip", zipPath);
            ZipFile.ExtractToDirectory(zipPath, dir);
            File.Delete(zipPath);

            string url = "file:///" + Path.Combine(dir, "index.html").Replace("\\\\", "/");
            OpenBrowser(url);
        }
        catch { }
    }

    static void OpenBrowser(string url)
    {
        // 1. WebView2 runtime (Win10 21H2+ / Win11)
        string[] roots = {
            @"C:\\\\Program Files (x86)\\\\Microsoft\\\\EdgeWebView\\\\Application",
            @"C:\\\\Program Files\\\\Microsoft\\\\EdgeWebView\\\\Application" };
        foreach (string root in roots)
        {
            if (!Directory.Exists(root)) continue;
            foreach (string ver in Directory.GetDirectories(root))
            {
                string exe = Path.Combine(ver, "msedgewebview2.exe");
                if (!File.Exists(exe)) continue;
                try { Process.Start(exe, "--app=" + url + " --window-size=520,640"); return; } catch { }
            }
        }
        // 2. Common browsers
        foreach (string b in new[]{"msedge","chrome","firefox"})
        {
            try { Process.Start(b, "--app=" + url); return; } catch { }
        }
        // 3. OS default
        try { Process.Start(url); } catch { }
    }

    static void ExtractRes(string name, string path)
    {
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
        using (FileStream f = new FileStream(path, FileMode.Create))
        {
            byte[] b = new byte[65536];
            int n;
            while ((n = s.Read(b, 0, b.Length)) > 0)
                f.Write(b, 0, n);
        }
    }
}
`);

// 编译
console.log("🔨 编译自解压 .exe...");
const outExe = path.join(ROOT, "AC-Cooling-Calculator.exe");
try {
  execSync(
    `"${CSC}" -target:winexe -r:System.IO.Compression.FileSystem.dll -resource:payload.zip -out:"${outExe}" launcher.cs`,
    { cwd: BUILD, stdio: "pipe" }
  );
  const kb = (fs.statSync(outExe).size / 1024).toFixed(1);
  console.log("✅ 打包完成: AC-Cooling-Calculator.exe (" + kb + " KB)");
} catch (e) {
  console.error("❌ 编译失败:", e.stderr?.toString() || e.message);
  process.exit(1);
}
