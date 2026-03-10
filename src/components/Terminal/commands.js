export const handleCommand = (commandLine, currentPath, setHistory, setPath, vfs, setVfs, isRoot = false) => {
    // Handle chained commands with &&
    if (commandLine.includes("&&")) {
        const commands = commandLine.split("&&").map(c => c.trim());
        let lastResult = { output: "" };
        let combinedOutput = [];
        for (const cmd of commands) {
            const result = handleCommand(cmd, currentPath, setHistory, setPath, vfs, setVfs, isRoot);
            if (result.clear) return result;
            if (result.sudoRequest) return result;
            if (result.nanoRequest) return result;
            if (result.output) combinedOutput.push(result.output);
            lastResult = result;
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

    const hasWritePermission = () => {
        return isRoot;
    };

    switch (cmd) {
        case "help":
            output = `
System Help Interface:
  Navigation: ls, cd, cat, pwd, clear, history, whoami, hostname, uname, uptime, date
  Search:     grep [pattern] [file]
  Files:      touch [file], rm [file], mkdir [dir], nano [file]  (requires sudo)
  System:     sudo [command], neofetch, echo
  Tip:        Use Tab for autocomplete, Up/Down for command history
      `;
            break;

        case "ls":
            const targetLs = resolvePath(arg);
            if (vfs[targetLs] && vfs[targetLs].type === "dir") {
                output = vfs[targetLs].children.join("  ");
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
            const catPath = resolvePath(arg);
            if (vfs[catPath] && vfs[catPath].type === "file") {
                output = vfs[catPath].content;
            } else {
                output = `cat: ${arg}: No such file or directory`;
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
                    output = ""; // Update timestamp (noop in demo)
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
                if (!hasWritePermission()) {
                    output = `rm: cannot remove '${arg}': Permission denied. Use: sudo rm ${arg}`;
                } else if (!vfs[rmPath]) {
                    output = `rm: cannot remove '${arg}': No such file or directory`;
                } else {
                    const newVfs = { ...vfs };
                    delete newVfs[rmPath];

                    // Correctly update parent directory children
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
                // Already authenticated, execute the command
                return handleCommand(args.slice(1).join(" "), currentPath, setHistory, setPath, vfs, setVfs, true);
            } else {
                return { sudoRequest: true, sudoCommand: args.slice(1).join(" ") };
            }
            break;

        case "clear": return { clear: true };
        case "whoami": output = isRoot ? "root" : "guest"; break;
        case "hostname": output = "dipanshu-vps"; break;
        case "uname": output = args.includes("-a") ? "Linux dipanshu-vps 5.15.0-76-generic #83-Ubuntu SMP x86_64 GNU/Linux" : "Linux"; break;
        case "date": output = new Date().toUTCString(); break;
        case "pwd": output = currentPath; break;
        case "echo": output = args.slice(1).join(" "); break;
        case "uptime": output = "23:42:05 up 12 days, 4:18,  1 user,  load average: 0.04, 0.05, 0.00"; break;
        case "neofetch":
            output = `       .---.\n      /     \\  dipanshu@dipanshu-vps\n      | (O) |  -------------------------\n      \\     /  OS: Portfolio Linux (User: Dipanshu Sengar)\n       '---'   Host: Resume Development Environment\n               Kernel: 5.15.0-76-generic\n               Uptime: 12 days, 4 hours\n               Shell: resume-sh 2.0\n               CPU: Virtualized Core (4) @ 2.4GHz\n               Memory: 4096MiB / 8192MiB\n               Disk: 45G / 100G (45%)\n               Location: /home/guest`;
            break;
        case "exit": output = "Connection closed by remote host."; break;
        case "": output = ""; break;
        case "history":
            return { historyRequest: true };
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
        default: output = `${cmd}: command not found. Type 'help' for available commands.`;
    }

    return { output };
};
