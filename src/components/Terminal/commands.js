// Admin credentials (hardcoded — single admin: Dipanshu)
const ADMIN_PASSWORD = "dipanshu";
const ALT_PASSWORD = "admin";

export const handleCommand = (commandLine, currentPath, setHistory, setPath, vfs, setVfs, isRoot = false) => {
    // Handle chained commands with &&
    if (commandLine.includes("&&")) {
        const commands = commandLine.split("&&").map(c => c.trim());
        let combinedOutput = [];
        for (const cmd of commands) {
            const result = handleCommand(cmd, currentPath, setHistory, setPath, vfs, setVfs, isRoot);
            if (result.clear) return result;
            if (result.sudoRequest) return result;
            if (result.nanoRequest) return result;
            if (result.output) combinedOutput.push(result.output);
        }
        return { output: combinedOutput.join("\n") };
    }

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

    const hasWritePermission = () => isRoot;

    // Build tree recursively
    const buildTree = (dir, prefix = "") => {
        const node = vfs[dir];
        if (!node || node.type !== "dir") return "";
        const children = node.children;
        let result = [];
        children.forEach((child, i) => {
            const isLast = i === children.length - 1;
            const connector = isLast ? "└── " : "├── ";
            const childPath = dir === "/" ? "/" + child : dir + "/" + child;
            const childNode = vfs[childPath];
            const isDir = childNode && childNode.type === "dir";
            result.push(prefix + connector + child + (isDir ? "/" : ""));
            if (isDir) {
                const nextPrefix = prefix + (isLast ? "    " : "│   ");
                result.push(buildTree(childPath, nextPrefix));
            }
        });
        return result.filter(Boolean).join("\n");
    };

    // Generate resume text for download
    const generateResumeText = () => {
        let text = "═══════════════════════════════════════════\n";
        text += "           DIPANSHU SENGAR — RESUME\n";
        text += "═══════════════════════════════════════════\n\n";

        const sections = [
            "/home/guest/resume/summary.md",
            "/home/guest/resume/personal_info.md",
            "/home/guest/resume/experience.md",
            "/home/guest/resume/projects.md",
            "/home/guest/resume/skills.md",
            "/home/guest/resume/education.md",
            "/home/guest/resume/certifications.md",
            "/home/guest/resume/achievements.md",
        ];

        sections.forEach(path => {
            if (vfs[path]) {
                text += vfs[path].content.trim() + "\n\n";
                text += "-------------------------------------------\n\n";
            }
        });

        text += "Generated from: https://dipanshu682.github.io/React-Portfolio/\n";
        return text;
    };

    switch (cmd) {
        case "help":
            output = `
┌─────────────────────────────────────────────────┐
│            SYSTEM HELP INTERFACE                │
├─────────────────────────────────────────────────┤
│  Navigation                                     │
│    ls, cd, cat, pwd, tree, grep [pat] [file]    │
│                                                 │
│  System                                         │
│    whoami, hostname, uname, uptime, date,       │
│    neofetch, history, clear, echo               │
│                                                 │
│  File Operations (requires sudo)               │
│    touch [file], rm [file], mkdir [dir],         │
│    nano [file]                                  │
│                                                 │
│  Portfolio                                      │
│    open [github|linkedin|email]                 │
│    download resume                              │
│    who / visitors                                │
│                                                 │
│  Fun                                            │
│    cowsay [message], sl, fortune                │
│                                                 │
│  Shortcuts                                      │
│    Tab = autocomplete, ↑↓ = history             │
│    Ctrl+L = clear, Ctrl+X = exit nano           │
│                                                 │
│  Admin: sudo [command]  (password required)     │
└─────────────────────────────────────────────────┘`;
            break;

        case "ls":
            const targetLs = resolvePath(arg);
            if (vfs[targetLs] && vfs[targetLs].type === "dir") {
                const children = vfs[targetLs].children;
                output = children.map(c => {
                    const childPath = targetLs === "/" ? "/" + c : targetLs + "/" + c;
                    const isDir = vfs[childPath] && vfs[childPath].type === "dir";
                    return isDir ? c + "/" : c;
                }).join("  ");
            } else {
                output = `ls: cannot access '${arg || targetLs}': No such file or directory`;
            }
            break;

        case "cd":
            if (!arg || arg === "~") {
                setPath("/home/guest");
            } else {
                const targetPath = resolvePath(arg);
                if (vfs[targetPath] && vfs[targetPath].type === "dir") {
                    setPath(targetPath);
                } else {
                    output = `cd: ${arg}: No such file or directory`;
                }
            }
            break;

        case "cat":
            if (!arg) {
                output = "cat: missing file operand";
            } else {
                const catPath = resolvePath(arg);
                if (vfs[catPath] && vfs[catPath].type === "file") {
                    output = vfs[catPath].content;
                } else {
                    output = `cat: ${arg}: No such file or directory`;
                }
            }
            break;

        case "tree": {
            const treePath = resolvePath(arg || ".");
            if (vfs[treePath] && vfs[treePath].type === "dir") {
                const dirName = arg || treePath.split("/").pop() || "/";
                output = dirName + "/\n" + buildTree(treePath);
            } else {
                output = `tree: '${arg || "."}': Not a directory`;
            }
            break;
        }

        case "grep":
            if (args.length < 3) {
                output = "Usage: grep [pattern] [file]";
            } else {
                const pattern = args[1];
                const grepFile = resolvePath(args[2]);
                if (vfs[grepFile] && vfs[grepFile].type === "file") {
                    const lines = vfs[grepFile].content.split("\n");
                    const matches = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
                    output = matches.length > 0 ? matches.join("\n") : `grep: no matches for '${pattern}'`;
                } else {
                    output = `grep: ${args[2]}: No such file or directory`;
                }
            }
            break;

        case "touch":
            if (!arg) {
                output = "touch: missing file operand";
            } else {
                const newFilePath = resolvePath(arg);
                if (!hasWritePermission()) {
                    output = `touch: cannot touch '${arg}': Permission denied. Use: sudo touch ${arg}`;
                } else if (vfs[newFilePath]) {
                    output = "";
                } else {
                    const newVfs = { ...vfs };
                    newVfs[newFilePath] = { type: "file", content: "" };
                    const pathParts = newFilePath.split("/").filter(Boolean);
                    const fileName = pathParts.pop();
                    const parentPath = "/" + pathParts.join("/");
                    if (newVfs[parentPath]) {
                        newVfs[parentPath].children.push(fileName);
                    }
                    setVfs(newVfs);
                }
            }
            break;

        case "mkdir":
            if (!arg) {
                output = "mkdir: missing operand";
            } else {
                const newDirPath = resolvePath(arg);
                if (!hasWritePermission()) {
                    output = `mkdir: cannot create directory '${arg}': Permission denied. Use: sudo mkdir ${arg}`;
                } else if (vfs[newDirPath]) {
                    output = `mkdir: cannot create directory '${arg}': File exists`;
                } else {
                    const newVfs = { ...vfs };
                    newVfs[newDirPath] = { type: "dir", children: [] };
                    const pathParts = newDirPath.split("/").filter(Boolean);
                    const dirName = pathParts.pop();
                    const parentPath = "/" + pathParts.join("/");
                    if (newVfs[parentPath]) {
                        newVfs[parentPath].children.push(dirName);
                    }
                    setVfs(newVfs);
                }
            }
            break;

        case "rm":
            if (!arg) {
                output = "rm: missing operand";
            } else {
                const rmPath = resolvePath(arg);
                if (args.includes("-rf") && arg === "/") {
                    if (!isRoot) {
                        output = "rm: Permission denied. Nice try though 😏";
                    } else {
                        output = `
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  JUST KIDDING! You really thought I'd
  let you delete my entire portfolio?
  
  System integrity: 100% preserved ✓
  Nice try, sysadmin! 😎
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥`;
                    }
                } else if (!hasWritePermission()) {
                    output = `rm: cannot remove '${arg}': Permission denied. Use: sudo rm ${arg}`;
                } else if (!vfs[rmPath]) {
                    output = `rm: cannot remove '${arg}': No such file or directory`;
                } else {
                    const newVfs = { ...vfs };
                    delete newVfs[rmPath];
                    const pathParts = rmPath.split("/").filter(Boolean);
                    const fileName = pathParts.pop();
                    const parentPath = "/" + pathParts.join("/");
                    if (newVfs[parentPath]) {
                        newVfs[parentPath].children = newVfs[parentPath].children.filter(c => c !== fileName);
                    }
                    setVfs(newVfs);
                }
            }
            break;

        case "nano":
        case "edit":
            if (!arg) {
                output = "nano: missing file operand";
            } else {
                const editPath = resolvePath(arg);
                if (!hasWritePermission()) {
                    output = `nano: permission denied. Use: sudo nano ${arg}`;
                } else if (vfs[editPath] && vfs[editPath].type === "dir") {
                    output = `nano: '${arg}' is a directory`;
                } else {
                    let content = "";
                    if (vfs[editPath] && vfs[editPath].type === "file") {
                        content = vfs[editPath].content;
                    }
                    return { nanoRequest: true, file: editPath, content: content };
                }
            }
            break;

        case "sudo":
            if (args.length < 2) {
                output = "usage: sudo <command>";
            } else if (isRoot) {
                return handleCommand(args.slice(1).join(" "), currentPath, setHistory, setPath, vfs, setVfs, true);
            } else {
                return { sudoRequest: true, sudoCommand: args.slice(1).join(" ") };
            }
            break;

        case "open": {
            const target = (arg || "").toLowerCase();
            const links = {
                github: "https://github.com/Dipanshu682",
                linkedin: "https://www.linkedin.com/in/dipanshu-sengar-188498204/",
                email: "mailto:dipanshusengar@gmail.com",
            };
            if (links[target]) {
                output = `Opening ${target}...`;
                return { output, openUrl: links[target] };
            } else {
                output = `Usage: open [github|linkedin|email]\nAvailable: ${Object.keys(links).join(", ")}`;
            }
            break;
        }

        case "download":
            if (arg === "resume" || arg === "resume.pdf" || arg === "resume.txt") {
                const resumeText = generateResumeText();
                output = "📥 Downloading resume... (resume.txt)";
                return { output, download: true, downloadContent: resumeText, downloadName: "Dipanshu_Sengar_Resume.txt" };
            } else {
                output = "Usage: download resume";
            }
            break;

        case "who":
        case "visitors":
        case "w": {
            const visitCount = parseInt(localStorage.getItem("portfolio_visits") || "0") + 1;
            localStorage.setItem("portfolio_visits", visitCount.toString());
            const now = new Date();
            output = ` ${now.toLocaleTimeString()} up 12 days, 1 user, load average: 0.04, 0.05, 0.00
USER     TTY      FROM             LOGIN@   IDLE   WHAT
guest    pts/0    visitor          ${now.toLocaleTimeString()}   0:00   exploring resume
─────────────────────────────────────────────────
Total sessions recorded: ${visitCount}`;
            break;
        }

        case "cowsay": {
            const msg = args.slice(1).join(" ") || "Hire Dipanshu!";
            const border = "─".repeat(msg.length + 2);
            output = ` ┌${border}┐
 │ ${msg} │
 └${border}┘
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
            break;
        }

        case "sl": {
            output = `
      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
|/-=|___|=    ||    ||    ||    |_____/~\\___/
 \\_/      \\O=====O=====O=====O_/      \\_/

🚂 Choo choo! You should have typed 'ls' instead!`;
            break;
        }

        case "fortune": {
            const fortunes = [
                "\"The best way to predict the future is to create it.\" — Peter Drucker",
                "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
                "\"First, solve the problem. Then, write the code.\" — John Johnson",
                "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" — Martin Fowler",
                "\"The only way to do great work is to love what you do.\" — Steve Jobs",
                "\"Debugging is twice as hard as writing the code in the first place.\" — Brian Kernighan",
                "\"Hire Dipanshu Sengar — he'll debug your life!\" 😄",
            ];
            output = "🔮 " + fortunes[Math.floor(Math.random() * fortunes.length)];
            break;
        }

        case "clear": return { clear: true };
        case "whoami": output = isRoot ? "root" : "guest"; break;
        case "hostname": output = "dipanshu-vps"; break;
        case "uname":
            output = args.includes("-a")
                ? "Linux dipanshu-vps 5.15.0-76-generic #83-Ubuntu SMP x86_64 GNU/Linux"
                : "Linux";
            break;
        case "date": output = new Date().toUTCString(); break;
        case "pwd": output = currentPath; break;
        case "echo": output = args.slice(1).join(" "); break;
        case "uptime":
            output = `${new Date().toLocaleTimeString()} up 12 days, 4:18,  1 user,  load average: 0.04, 0.05, 0.00`;
            break;
        case "neofetch":
            output = `
       .---.        dipanshu@dipanshu-vps
      /     \\       ─────────────────────────
      | (●) |       OS: Portfolio Linux v1.1.0-LTS
      \\     /       Host: Dipanshu Sengar's Resume
       '---'        Kernel: 5.15.0-76-generic
                    Uptime: 12 days, 4 hours
                    Shell: resume-sh 2.0
                    Role: Junior Python Developer
                    Stack: Python, Django, DRF, AWS
                    CPU: Virtualized Core (4) @ 2.4GHz
                    Memory: 4096MiB / 8192MiB
                    Disk: 45G / 100G (45%)
                    Contact: github.com/Dipanshu682`;
            break;
        case "history":
            return { historyRequest: true };
        case "exit":
            output = "logout\nConnection to dipanshu-vps closed.";
            break;
        case "":
            output = "";
            break;
        default:
            output = `${cmd}: command not found. Type 'help' for available commands.`;
    }

    return { output };
};
