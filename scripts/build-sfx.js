/**
 * 空调制冷量计算器 — 自解压 .exe 构建脚本
 *
 * 流程：
 *   1. neu build（生成 Neutralinojs 运行时）
 *   2. 打包项目文件为 payload.zip
 *   3. C# 编译器嵌入 app.exe + payload.zip → 单文件 .exe
 *   4. 运行时：提取 → 解压 → --load-dir-res 启动
 *
 * 依赖：Windows 自带 .NET Framework 4.x (csc.exe)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "dist", "build");
const CSC = "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe";

// 1. 运行 neu build
console.log("📦 构建 Neutralinojs 运行时...");
execSync("npx neu build", { cwd: ROOT, stdio: "inherit" });

// 2. 准备资源文件
console.log("📁 准备项目资源...");
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });

const distDir = path.join(ROOT, "dist", "ac-cooling-calculator");
const appSrc = path.join(distDir, "ac-cooling-calculator-win_x64.exe");
if (!fs.existsSync(appSrc)) {
  console.error("❌ neu build 产物不存在");
  process.exit(1);
}
fs.copyFileSync(appSrc, path.join(BUILD, "app_payload.bin"));

// 复制项目文件
fs.copyFileSync(path.join(ROOT, "neutralino.config.json"), path.join(BUILD, "neutralino.config.json"));
fs.mkdirSync(path.join(BUILD, "resources"), { recursive: true });
fs.readdirSync(path.join(ROOT, "resources")).forEach(f => {
  fs.copyFileSync(path.join(ROOT, "resources", f), path.join(BUILD, "resources", f));
});
if (fs.existsSync(path.join(ROOT, "assets", "icon.png"))) {
  fs.mkdirSync(path.join(BUILD, "assets"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "assets", "icon.png"), path.join(BUILD, "assets", "icon.png"));
}

// 3. 打包为 ZIP
console.log("🗜️  压缩项目资源...");
execSync(
  'powershell -Command "Compress-Archive -Path resources,assets,neutralino.config.json -DestinationPath payload.zip -Force"',
  { cwd: BUILD, stdio: "pipe" }
);

// 4. 写入 C# 源码
fs.writeFileSync(path.join(BUILD, "launcher.cs"), `using System;
using System.IO;
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

            string appPath = Path.Combine(dir, "app.exe");
            ExtractRes("app.exe", appPath);

            string zipPath = Path.Combine(dir, "payload.zip");
            ExtractRes("payload.zip", zipPath);

            Process.Start(new ProcessStartInfo
            {
                FileName = "powershell",
                Arguments = "-Command \\"Expand-Archive -Path '" + zipPath + "' -DestinationPath '" + dir + "' -Force\\"",
                UseShellExecute = false,
                CreateNoWindow = true
            }).WaitForExit(15000);

            Process.Start(new ProcessStartInfo
            {
                FileName = appPath,
                Arguments = "--load-dir-res --path=.",
                WorkingDirectory = dir,
                UseShellExecute = false
            });
        }
        catch { }
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

// 5. 编译 C# 自解压程序
console.log("🔨 编译自解压 .exe...");
const outExe = path.join(ROOT, "AC-Cooling-Calculator.exe");
const compileCmd =
  `"${CSC}" -target:winexe -resource:app_payload.bin,app.exe -resource:payload.zip,payload.zip -out:"${outExe}" launcher.cs`;

try {
  execSync(compileCmd, { cwd: BUILD, stdio: "pipe" });
  const sizeMB = (fs.statSync(outExe).size / 1024 / 1024).toFixed(2);
  console.log("✅ 打包完成: AC-Cooling-Calculator.exe (" + sizeMB + " MB)");
} catch (e) {
  console.error("❌ 编译失败:", e.stderr?.toString() || e.message);
  process.exit(1);
}
