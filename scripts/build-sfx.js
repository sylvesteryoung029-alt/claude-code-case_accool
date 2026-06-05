/**
 * 空调制冷量计算器 — 打包为单文件 .exe
 *
 * 内嵌 HTML/CSS/JS 资源，运行时提取到 %TEMP%，
 * 尝试 Chrome/Edge --app 无边框模式，回退到默认浏览器
 *
 * 依赖：Windows .NET Framework 4.x (csc.exe)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "dist", "build");
const CSC = "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe";

console.log("📦 准备资源...");
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });

const resources = path.join(ROOT, "resources");
fs.copyFileSync(path.join(resources, "index.html"), path.join(BUILD, "index.html"));
fs.copyFileSync(path.join(resources, "style.css"), path.join(BUILD, "style.css"));
fs.copyFileSync(path.join(resources, "app.js"), path.join(BUILD, "app.js"));

fs.writeFileSync(path.join(BUILD, "launcher.cs"), `using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;

class Launcher
{
    [STAThread]
    static void Main()
    {
        string dir = Path.Combine(Path.GetTempPath(), "AC_Cooling_Calc");
        try { if(Directory.Exists(dir)) Directory.Delete(dir,true); } catch{}
        Directory.CreateDirectory(dir);
        foreach(string n in Assembly.GetExecutingAssembly().GetManifestResourceNames())
        {
            string p = Path.Combine(dir, n);
            using(Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(n))
            using(FileStream f = new FileStream(p, FileMode.Create))
            { byte[] b = new byte[65536]; int k; while((k=s.Read(b,0,b.Length))>0) f.Write(b,0,k); }
        }
        string url = "file:///" + Path.Combine(dir,"index.html").Replace("\\\\","/");
        string[] browsers = {
            @"D:\\\\RunningCheeseChrome\\\\App\\\\chrome.exe",
            @"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
            @"C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
            @"C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
            @"C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
        };
        foreach (string exe in browsers)
        {
            if (!File.Exists(exe)) continue;
            try {
                Process.Start(new ProcessStartInfo {
                    FileName = exe,
                    Arguments = "--app=" + url + " --window-size=520,640",
                    UseShellExecute = false });
                return;
            } catch { }
        }
        Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
    }
}
`);

console.log("🔨 编译...");
const outExe = path.join(ROOT, "AC-Cooling-Calculator.exe");
try {
  execSync(
    `"${CSC}" -target:winexe -resource:index.html -resource:style.css -resource:app.js -out:"${outExe}" launcher.cs`,
    { cwd: BUILD, stdio: "pipe" }
  );
  const kb = (fs.statSync(outExe).size / 1024).toFixed(1);
  console.log("✅ AC-Cooling-Calculator.exe (" + kb + " KB)");
} catch (e) {
  console.error("❌ 编译失败:", e.stderr?.toString() || e.message);
  process.exit(1);
}
