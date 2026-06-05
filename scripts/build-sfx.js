/**
 * 空调制冷量计算器 — 自解压 .exe 构建脚本
 *
 * 流程：用 csc.exe 将 neu build 产物嵌入 C# launcher，输出单文件 .exe
 * 依赖：Windows 自带 .NET Framework 4.x (csc.exe)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist", "ac-cooling-calculator");
const BUILD = path.join(ROOT, "dist", "build");
const CSC = "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe";

// 1. 准备构建目录
fs.mkdirSync(BUILD, { recursive: true });

const appExe = path.join(DIST, "ac-cooling-calculator-win_x64.exe");
const resNeu = path.join(DIST, "resources.neu");

if (!fs.existsSync(appExe) || !fs.existsSync(resNeu)) {
  console.error("❌ 请先运行 npx neu build");
  process.exit(1);
}

fs.copyFileSync(appExe, path.join(BUILD, "app_payload.exe"));
fs.copyFileSync(resNeu, path.join(BUILD, "resources.neu"));

// 2. 写入 C# 源码
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

            string exe = Path.Combine(dir, "app.exe");
            string neu = Path.Combine(dir, "resources.neu");

            Extract("app_payload.exe", exe);
            Extract("resources.neu", neu);

            Process.Start(new ProcessStartInfo
            {
                FileName = exe,
                WorkingDirectory = dir,
                UseShellExecute = false
            });
        }
        catch { }
    }

    static void Extract(string name, string path)
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

// 3. 编译
const outExe = path.join(ROOT, "AC-Cooling-Calculator.exe");
const cmd = `"${CSC}" -nologo -target:winexe -resource:app_payload.exe -resource:resources.neu -out:"${outExe}" launcher.cs`;

try {
  execSync(cmd, { cwd: BUILD, stdio: "pipe" });
  const size = (fs.statSync(outExe).size / 1024 / 1024).toFixed(2);
  console.log(`✅ 打包完成: AC-Cooling-Calculator.exe (${size} MB)`);
} catch (e) {
  console.error("❌ 编译失败:", e.stderr?.toString() || e.message);
  process.exit(1);
}
