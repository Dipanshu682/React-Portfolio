import { vfs } from './vfs';

export const handleCommand = (commandLine, currentPath, setHistory, setPath) => {
    const args = commandLine.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    const arg = args[1];

    let output = "";

    const resolvePath = (path) => {
        if (!path) return currentPath;
        if (path === "~") return "/home/guest";
        if (path === "/") return "/";
        if (path === "..") {
            if (currentPath === "/") return "/";
            const parts = currentPath.split("/").filter(Boolean);
            parts.pop();
            return "/" + parts.join("/");
        }
        if (path.startsWith("/")) return path.replace(/\/+/g, "/");
        const cleanPath = (currentPath === "/" ? "" : currentPath) + "/" + path;
        return cleanPath.replace(/\/+/g, "/");
    };

    switch (cmd) {
        case "help":
            output = `
System Help Interface:
  Usage: [command] [options] [arguments]

Standard Commands:
  ls [path]     List directory contents
  cd [path]     Change the current directory
  cat [file]    Display file contents
  pwd           Print the current working directory
  clear         Clear the terminal screen
  history       Display command history

System Information:
  neofetch      Display system/hardware information
  uname -a      Display kernel/system information
  hostname      Display system network name
  whoami        Display current effective user
  uptime       Display system uptime

Utilities:
  echo [text]   Display a line of text
  date          Display current date and time
  sudo [cmd]    Execute as superuser (restricted)
  exit          Terminate terminal session
      `;
            break;

        case "ls":
            const isRecursive = args.includes("-R");
            const targetArg = args.find(a => a !== "ls" && a !== "-R");
            const lsPath = resolvePath(targetArg);

            if (vfs[lsPath] && vfs[lsPath].type === "dir") {
                output = vfs[lsPath].children.join("  ");
            } else {
                output = `ls: cannot access '${targetArg || lsPath}': No such file or directory`;
            }
            break;

        case "cd":
            if (!arg || arg === "~") {
                setPath("/home/guest");
                output = "";
            } else {
                const targetPath = resolvePath(arg);
                if (vfs[targetPath] && vfs[targetPath].type === "dir") {
                    setPath(targetPath);
                    output = "";
                } else {
                    output = `cd: ${arg}: No such file or directory`;
                }
            }
            break;

        case "cat":
            if (!arg) {
                output = "cat: missing file operand";
            } else {
                const filePath = resolvePath(arg);
                if (vfs[filePath] && vfs[filePath].type === "file") {
                    output = vfs[filePath].content;
                } else {
                    output = `cat: ${arg}: No such file or directory`;
                }
            }
            break;

        case "clear":
            return { clear: true };

        case "whoami":
            output = "guest";
            break;

        case "hostname":
            output = "dipanshu-vps";
            break;

        case "uname":
            output = args.includes("-a") ? "Linux dipanshu-vps 5.15.0-76-generic #83-Ubuntu SMP x86_64 GNU/Linux" : "Linux";
            break;

        case "date":
            output = new Date().toUTCString();
            break;

        case "pwd":
            output = currentPath;
            break;

        case "echo":
            output = args.slice(1).join(" ");
            break;

        case "uptime":
            output = "23:42:05 up 12 days, 4:18,  1 user,  load average: 0.04, 0.05, 0.00";
            break;

        case "neofetch":
            output = `
       .---.
      /     \\  dipanshu@dipanshu-vps
      | (O) |  -------------------------
      \\     /  OS: Portfolio Linux (User: Dipanshu Sengar)
       '---'   Host: Resume Development Environment
               Kernel: 5.15.0-76-generic
               Uptime: 12 days, 4 hours
               Shell: resume-sh 2.0
               CPU: Virtualized Core (4) @ 2.4GHz
               Memory: 4096MiB / 8192MiB
               Disk: 45G / 100G (45%)
               Location: /home/guest
      `;
            break;

        case "sudo":
            output = "[sudo] password for dipanshu: \nSorry, user dipanshu is not allowed to execute 'sudo' on this host.";
            break;

        case "exit":
            output = "Connection closed by remote host.";
            break;

        case "":
            output = "";
            break;

        default:
            output = `${cmd}: command not found. List available commands with 'help'.`;
    }

    return { output };
};
