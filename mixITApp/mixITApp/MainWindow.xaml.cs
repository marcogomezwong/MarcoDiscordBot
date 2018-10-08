using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace mixITApp {
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window {
        public MainWindow() {
            InitializeComponent();
        }
        string song_path, python_path, script_path;
        private void run_bpm(string py, string script, string song) {
            Process p = new Process();
            p.StartInfo = new ProcessStartInfo(py, script) {
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            p.Start();

            string output = p.StandardOutput.ReadToEnd();
            p.WaitForExit();
            BpmNum.Text = output;
            return;

        }
        private void browseBtn_Click(object sender, RoutedEventArgs e) {
            OpenFileDialog file = new OpenFileDialog();
            if (file.ShowDialog() == true) {
                song_path = file.FileName;
                python_path = @"C:\Users\Marco\AppData\Local\Programs\Python\Python35-32\python.exe";
                script_path = @"C:\Users\Marco\Desktop\mixIT\bpm_detector.py " + song_path;
                filenameTb.Text = song_path;
            } else {
                return;
            }
            return;
        }

        private void AutodetectBpmBtn_Click(object sender, RoutedEventArgs e) {
            run_bpm(python_path, script_path, song_path);
            return;
        }
    }
}
