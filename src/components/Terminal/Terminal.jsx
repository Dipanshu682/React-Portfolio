import React, { useState, useRef, useEffect } from "react";
import "./Terminal.css";
import { handleCommand } from "./commands";
import { vfs as initialVfs } from "./vfs";

const BOOT_LINES = [
    "[    0.000000] Linux version 5.15.0-76-generic (gcc 11.4.0) #83-Ubuntu SMP",
    "[    0.003214] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-76-generic root=/dev/sda1",
    "[    0.012841] BIOS-provided physical RAM map:",
    "[    0.012843]  BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
    "[    0.048201] CPU: Intel(R) Xeon(R) @ 2.40GHz (4 cores)",
    "[    0.102914] Memory: 8192MB available",
    "[    0.148201] Disk /dev/sda: 100GB",
    "[    0.192543] Loading initial ramdisk ...",
    "[    0.291034] systemd[1]: Set hostname to <dipanshu-vps>",
    "[    0.384012] systemd[1]: Starting Portfolio OS v1.1.0-LTS ...",
    "[    0.491023] systemd[1]: Started Network Manager.",
    "[    0.582031] systemd[1]: Started SSH daemon.",
    "[    0.691201] systemd[1]: Reached target Multi-User System.",
    "",
    "   ____  _                             _           ",
    "  |  _ \\(_)_ __   __ _ _ __  ___| |__  _   _ ",
    "  | | | | | '_ \\ / _` | '_ \\/ __| '_ \\| | | |",
    "  | |_| | | |_) | (_| | | | \\__ \\ | | | |_| |",
    "  |____/|_| .__/ \\__,_|_| |_|___/_| |_|\\__,_|",
    "          |_|    Portfolio Terminal v1.1.0",
    "",
];

const Terminal = () => {
    const [vfs, setVfs] = useState(initialVfs);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]);
    const [currentPath, setCurrentPath] = useState("/home/guest");
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Mode states
    const [isPasswordMode, setIsPasswordMode] = useState(false);
    const [sudoCommand, setSudoCommand] = useState("");
    const [nanoMode, setNanoMode] = useState(false);
    const [nanoFile, setNanoFile] = useState("");
    const [nanoContent, setNanoContent] = useState("");

    // Boot & intro states
    const [isBooting, setIsBooting] = useState(true);
    const [bootLines, setBootLines] = useState([]);
    const [isAutoTyping, setIsAutoTyping] = useState(false);
    const [showMobileHint, setShowMobileHint] = useState(true);

    const inputRef = useRef(null);
    const terminalEndRef = useRef(null);

    // Boot animation
    useEffect(() => {
        let i = 0;
        const bootInterval = setInterval(() => {
            if (i < BOOT_LINES.length) {
                setBootLines(prev => [...prev, BOOT_LINES[i]]);
                i++;
            } else {
                clearInterval(bootInterval);
                setTimeout(() => {
                    setIsBooting(false);
                    setHistory([
                        { type: "output", content: "Last login: " + new Date().toUTCString() + " on ttys001" },
                        { type: "output", content: "System: Portfolio OS v1.1.0-LTS (Dipanshu Sengar's CV)" },
                        { type: "output", content: 'Type "help" for commands. Try "cd resume && ls" to explore.' },
                    ]);
                    // Start auto-typing demo
                    setTimeout(() => startAutoType(), 800);
                }, 600);
            }
        }, 80);
        return () => clearInterval(bootInterval);
    }, []);

    // Auto-type demo
    const startAutoType = () => {
        const demoCommand = "cd resume && ls";
        setIsAutoTyping(true);
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < demoCommand.length) {
                setInput(demoCommand.slice(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    // Simulate Enter
                    const prompt = `dipanshu@dipanshu-vps:~$ `;
                    const result = handleCommand(demoCommand, "/home/guest", setHistory, setCurrentPath, vfs, setVfs, false);
                    setHistory(prev => [
                        ...prev,
                        { type: "input", prompt: prompt, command: demoCommand },
                        { type: "output", content: result.output },
                    ]);
                    setCommandHistory([demoCommand]);
                    setInput("");
                    setIsAutoTyping(false);
                    inputRef.current?.focus();
                }, 400);
            }
        }, 60);
    };

    const scrollToBottom = () => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (!isBooting && !isAutoTyping && !nanoMode) {
            inputRef.current?.focus();
        }
    }, [history, bootLines, isBooting]);

    // Hide mobile hint on first interaction
    const handleContainerClick = () => {
        setShowMobileHint(false);
        if (!nanoMode) inputRef.current?.focus();
    };

    const processResult = (result, newHistory) => {
        if (result.sudoRequest) {
            setIsPasswordMode(true);
            setSudoCommand(result.sudoCommand);
            setHistory([...newHistory, { type: "output", content: `[sudo] password for dipanshu: ` }]);
        } else if (result.nanoRequest) {
            setNanoMode(true);
            setNanoFile(result.file);
            setNanoContent(result.content);
            setHistory([...newHistory]);
        } else if (result.historyRequest) {
            const histOutput = commandHistory.slice().reverse().map((c, i) => `  ${i + 1}  ${c}`).join("\n");
            setHistory([...newHistory, { type: "output", content: histOutput || "(no history)" }]);
        } else if (result.clear) {
            setHistory([]);
        } else if (result.download) {
            setHistory([...newHistory, { type: "output", content: result.output }]);
            // Trigger download
            const blob = new Blob([result.downloadContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.downloadName;
            a.click();
            URL.revokeObjectURL(url);
        } else if (result.openUrl) {
            setHistory([...newHistory, { type: "output", content: result.output }]);
            window.open(result.openUrl, "_blank");
        } else {
            setHistory([...newHistory, { type: "output", content: result.output }]);
        }
    };

    const handleKeyDown = (e) => {
        if (isAutoTyping) return;

        if (e.key === "Enter") {
            setShowMobileHint(false);

            if (isPasswordMode) {
                const password = input.trim();
                setIsPasswordMode(false);
                setInput("");

                if (password === "dipanshu" || password === "admin") {
                    const result = handleCommand(sudoCommand, currentPath, setHistory, setCurrentPath, vfs, setVfs, true);
                    processResult(result, history);
                } else {
                    setHistory(prev => [...prev, { type: "output", content: "sudo: 1 incorrect password attempt" }]);
                }
                setSudoCommand("");
                return;
            }

            const trimmedInput = input.trim();
            const prompt = `dipanshu@dipanshu-vps:${currentPath.replace("/home/guest", "~")}$ `;
            const newHistory = [...history, { type: "input", prompt: prompt, command: input }];

            const result = handleCommand(input, currentPath, setHistory, setCurrentPath, vfs, setVfs, false);
            processResult(result, newHistory);

            if (trimmedInput) {
                setCommandHistory([trimmedInput, ...commandHistory]);
            }
            setInput("");
            setHistoryIndex(-1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput("");
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            const parts = input.trim().split(/\s+/);
            const partial = parts[parts.length - 1];
            if (partial) {
                const dir = vfs[currentPath];
                if (dir && dir.children) {
                    const matches = dir.children.filter(c => c.startsWith(partial));
                    if (matches.length === 1) {
                        parts[parts.length - 1] = matches[0];
                        setInput(parts.join(" "));
                    } else if (matches.length > 1) {
                        // Show possible completions
                        const prompt = `dipanshu@dipanshu-vps:${currentPath.replace("/home/guest", "~")}$ `;
                        setHistory(prev => [
                            ...prev,
                            { type: "input", prompt: prompt, command: input },
                            { type: "output", content: matches.join("  ") },
                        ]);
                    }
                }
            }
        } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            setHistory([]);
        }
    };

    const handleNanoKeyDown = (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "x") {
            e.preventDefault();

            const newVfs = { ...vfs };
            const pathParts = nanoFile.split("/").filter(Boolean);
            const fileName = pathParts.pop();
            const parentPath = "/" + pathParts.join("/");

            if (!newVfs[nanoFile]) {
                newVfs[nanoFile] = { type: "file", content: "" };
                if (newVfs[parentPath]) {
                    newVfs[parentPath].children.push(fileName);
                }
            }

            newVfs[nanoFile].content = nanoContent;
            setVfs(newVfs);

            setNanoMode(false);
            const lineCount = nanoContent.split("\n").length;
            setHistory(prev => [...prev, { type: "output", content: `[Wrote ${lineCount} lines to ${nanoFile}]` }]);

            setTimeout(() => inputRef.current?.focus(), 10);
        }
    };

    // Render a line with syntax highlighting for cat output
    const renderLine = (line) => {
        if (line.type === "input") {
            return (
                <div className="line input">
                    <span className="prompt">{line.prompt}</span>
                    <span className="command-text">{line.command}</span>
                </div>
            );
        }

        // For output, apply syntax highlighting
        const content = line.content || "";
        const htmlContent = content
            .replace(/^(## .+)$/gm, '<span class="hl-heading">$1</span>')
            .replace(/^(### .+)$/gm, '<span class="hl-subheading">$1</span>')
            .replace(/^(# .+)$/gm, '<span class="hl-title">$1</span>')
            .replace(/\*\*(.+?)\*\*/g, '<span class="hl-bold">$1</span>')
            .replace(/\*(.+?)\*/g, '<span class="hl-italic">$1</span>')
            .replace(/^(\s*-\s)/gm, '<span class="hl-bullet">$1</span>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="hl-link">$1</a>')
            .replace(/(linkedin\.com\/[^\s<]+)/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer" class="hl-link">$1</a>')
            .replace(/(github\.com\/[^\s<]+)/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer" class="hl-link">$1</a>');

        return (
            <div className="line output" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        );
    };

    // Boot screen
    if (isBooting) {
        return (
            <div className="terminal-container boot-screen">
                <div className="terminal-body scrollbar-hidden">
                    {bootLines.map((line, i) => (
                        <div key={i} className="line boot-line">{line}</div>
                    ))}
                </div>
            </div>
        );
    }

    // Nano mode
    if (nanoMode) {
        return (
            <div className="terminal-container">
                <div className="nano-container">
                    <div className="nano-header">
                        <span>GNU nano 7.2</span>
                        <span>File: {nanoFile}</span>
                        <span>Modified</span>
                    </div>
                    <textarea
                        className="nano-textarea"
                        value={nanoContent}
                        onChange={(e) => setNanoContent(e.target.value)}
                        onKeyDown={handleNanoKeyDown}
                        autoFocus
                    />
                    <div className="nano-footer">
                        <span>^X Exit & Save</span>
                        <span>^K Cut</span>
                        <span>^U Paste</span>
                        <span>^W Search</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="terminal-container" onClick={handleContainerClick}>
            <div className="terminal-body scrollbar-hidden">
                {history.map((line, index) => (
                    <React.Fragment key={index}>
                        {renderLine(line)}
                    </React.Fragment>
                ))}
                <div className="input-line">
                    {!isPasswordMode && (
                        <span className="prompt">
                            dipanshu@dipanshu-vps:{currentPath.replace("/home/guest", "~")}$
                        </span>
                    )}
                    {isPasswordMode && (
                        <span className="prompt">[sudo] password: </span>
                    )}
                    <input
                        ref={inputRef}
                        type={isPasswordMode ? "password" : "text"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        autoFocus
                        disabled={isAutoTyping}
                    />
                </div>
                {showMobileHint && (
                    <div className="mobile-hint">👆 Tap here to start typing commands</div>
                )}
                <div ref={terminalEndRef} />
            </div>
            <div className="terminal-overlay"></div>
        </div>
    );
};

export default Terminal;
