using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace PerpustakaanSBTH
{
    static class Program
    {
        private static Mutex mutex = null;
        private static Process serverProcess = null;
        private static NotifyIcon trayIcon = null;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool createdNew;
            mutex = new Mutex(true, "PerpustakaanSBTH_SingleInstance_Mutex_App", out createdNew);

            if (!createdNew)
            {
                // Sudah ada aplikasi yang berjalan, cukup buka browser
                OpenBrowser("http://localhost:3000");
                return;
            }

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            Environment.CurrentDirectory = appDir;

            // Tambahkan path Node.js jika belum ada di session PATH
            string currentPath = Environment.GetEnvironmentVariable("PATH") ?? "";
            string nodePaths = @"C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;" +
                               Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\node");
            Environment.SetEnvironmentVariable("PATH", currentPath + ";" + nodePaths);

            // Cek ketersediaan Node.js
            if (!IsNodeAvailable())
            {
                MessageBox.Show(
                    "Node.js belum terdeteksi di komputer ini.\n\n" +
                    "Silakan buka folder 'INSTALLER_PENDUKUNG' lalu klik 2x file:\n" +
                    "'node-js v24.22.0-x64.msi' untuk menginstal.\n\n" +
                    "Setelah selesai instalasi, buka kembali aplikasi ini.",
                    "Perpustakaan SBTH TK - Node.js Diperlukan",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return;
            }

            // Jika server sudah berjalan di port 3000, langsung buka browser
            if (IsServerReady("http://localhost:3000", 800))
            {
                OpenBrowser("http://localhost:3000");
                SetupTrayIcon(appDir);
                Application.Run();
                return;
            }

            // Bersihkan zombie process di port 3000 jika ada sisa macet
            CleanupStaleProcesses();

            // Tampilkan splash screen modern
            SplashForm splash = new SplashForm(appDir);
            splash.Show();
            Application.DoEvents();

            // Jalankan server di latar belakang secara 100% SILENT (Tanpa CMD Hitam)
            StartBackgroundServer(appDir);

            // Loop tunggu sampai server siap di background dengan polling cepat (200ms)
            ThreadPool.QueueUserWorkItem(delegate
            {
                for (int i = 0; i < 150; i++)
                {
                    Thread.Sleep(200);
                    if (IsServerReady("http://localhost:3000", 300))
                    {
                        break;
                    }
                }

                // Setelah siap, buka browser dan pasang ikon di Tray
                splash.Invoke(new Action(delegate
                {
                    splash.Close();
                    OpenBrowser("http://localhost:3000");
                    SetupTrayIcon(appDir);
                }));
            });

            Application.Run();
        }

        private static bool IsNodeAvailable()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "node.exe",
                    Arguments = "-v",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true
                };
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit(3000);
                    return p.ExitCode == 0;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void CleanupStaleProcesses()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c taskkill /F /IM node.exe",
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit(2000);
                }
            }
            catch { }
        }

        private static void StartBackgroundServer(string appDir)
        {
            try
            {
                // Prioritaskan 'npm start' jika folder .next sudah dibuild (super kilat < 500ms dan hemat RAM)
                // Jika belum dibuild, fallback ke 'npm run dev'
                string dotNext = Path.Combine(appDir, ".next");
                string npmCommand = Directory.Exists(dotNext) ? "/c npm start" : "/c npm run dev";

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = npmCommand,
                    WorkingDirectory = appDir,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    UseShellExecute = false
                };
                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Gagal memulai server: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static bool IsServerReady(string url, int timeoutMs)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = timeoutMs;
                req.Method = "HEAD";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    return res.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                try
                {
                    HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                    req.Timeout = timeoutMs;
                    req.Method = "GET";
                    using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                    {
                        return res.StatusCode == HttpStatusCode.OK;
                    }
                }
                catch
                {
                    return false;
                }
            }
        }

        private static void OpenBrowser(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch
            {
                Process.Start("cmd.exe", "/c start " + url);
            }
        }

        private static void SetupTrayIcon(string appDir)
        {
            if (trayIcon != null) return;

            trayIcon = new NotifyIcon();
            trayIcon.Text = "Perpustakaan SBTH TK (Aktif)";
            
            string iconPath = Path.Combine(appDir, @"public\app_icon.ico");
            if (File.Exists(iconPath))
            {
                try { trayIcon.Icon = new Icon(iconPath); }
                catch { trayIcon.Icon = SystemIcons.Application; }
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add("📖 Buka Perpustakaan di Browser", delegate { OpenBrowser("http://localhost:3000"); });
            menu.MenuItems.Add("🌐 Info Akses HP / PC Lain (LAN)", delegate { ShowLanInfo(); });
            menu.MenuItems.Add("-");
            menu.MenuItems.Add("🛑 Tutup & Keluar Aplikasi", delegate
            {
                StopApplication();
            });

            trayIcon.ContextMenu = menu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += delegate { OpenBrowser("http://localhost:3000"); };

            trayIcon.ShowBalloonTip(3000, "Perpustakaan SBTH TK", "Aplikasi aktif di latar belakang (klik ikon di sini kapan saja)", ToolTipIcon.Info);
        }

        private static void ShowLanInfo()
        {
            string localIp = GetLocalIPAddress();
            string msg = "Aplikasi Perpustakaan SBTH TK dapat diakses dari:\n\n" +
                         "1. Komputer ini: http://localhost:3000\n";
            if (!string.IsNullOrEmpty(localIp))
            {
                msg += "2. HP Guru / PC Lain (WiFi yang sama):\n   http://" + localIp + ":3000\n";
            }
            MessageBox.Show(msg, "Info Akses Jaringan Perpustakaan SBTH", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private static string GetLocalIPAddress()
        {
            try
            {
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork && !ip.ToString().StartsWith("127."))
                    {
                        return ip.ToString();
                    }
                }
            }
            catch { }
            return "";
        }

        private static void StopApplication()
        {
            try
            {
                if (trayIcon != null)
                {
                    trayIcon.Visible = false;
                    trayIcon.Dispose();
                }

                CleanupStaleProcesses();

                if (serverProcess != null && !serverProcess.HasExited)
                {
                    serverProcess.Kill();
                }
            }
            catch { }

            Application.Exit();
        }
    }

    public class SplashForm : Form
    {
        public SplashForm(string appDir)
        {
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(420, 210);
            this.BackColor = Color.FromArgb(248, 250, 252); // Modern Slate 50
            this.TopMost = true;

            string iconPath = Path.Combine(appDir, @"public\app_icon.ico");
            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            Panel card = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };
            this.Controls.Add(card);

            // Title
            Label title = new Label
            {
                Text = "PERPUSTAKAAN DIGITAL SBTH TK",
                Font = new Font("Segoe UI", 12.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                AutoSize = false,
                Size = new Size(380, 30),
                Location = new Point(20, 25),
                TextAlign = ContentAlignment.MiddleCenter
            };
            card.Controls.Add(title);

            // Subtitle
            Label subtitle = new Label
            {
                Text = "Sedang menyalakan sistem aplikasi...\nBrowser web akan terbuka secara otomatis.",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(71, 85, 105),
                AutoSize = false,
                Size = new Size(380, 45),
                Location = new Point(20, 65),
                TextAlign = ContentAlignment.MiddleCenter
            };
            card.Controls.Add(subtitle);

            // Progress Bar Marquee
            ProgressBar pb = new ProgressBar
            {
                Style = ProgressBarStyle.Marquee,
                MarqueeAnimationSpeed = 25,
                Size = new Size(340, 10),
                Location = new Point(40, 125)
            };
            card.Controls.Add(pb);

            // Footer note
            Label footer = new Label
            {
                Text = "100% Mode Senyap (Tanpa Jendela Hitam CMD)",
                Font = new Font("Segoe UI", 8f, FontStyle.Italic),
                ForeColor = Color.FromArgb(148, 163, 184),
                AutoSize = false,
                Size = new Size(380, 20),
                Location = new Point(20, 155),
                TextAlign = ContentAlignment.MiddleCenter
            };
            card.Controls.Add(footer);

            // Border effect
            this.Paint += delegate(object sender, PaintEventArgs e)
            {
                ControlPaint.DrawBorder(e.Graphics, this.ClientRectangle, Color.FromArgb(203, 213, 225), ButtonBorderStyle.Solid);
            };
        }
    }
}
