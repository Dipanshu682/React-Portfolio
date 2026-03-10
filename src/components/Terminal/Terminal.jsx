import React, { useState, useRef, useEffect } from "react";
import "./Terminal.css";
import { handleCommand } from "./commands";
import { vfs as initialVfs } from "./vfs";

const Terminal = () => {
    const [vfs, setVfs] = useState(initialVfs);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([
        { type: "output", content: "Last login: " + new Date().toUTCString() + " on ttys001" },
        { type: "output", content: "System: Portfolio OS v1.1.0-LTS (Dipanshu Sengar's CV)" },
        { type: "output", content: 'Type "cd resume && ls" to view my professional background.' },
    ]);
    const [currentPath, setCurrentPath] = useState("/home/guest");
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Sudo & Mode States
    const [isPasswordMode, setIsPasswordMode] = useState(false);
    const [sudoCommand, setSudoCommand] = useState("");

    // Nano Editor States
    const [nanoMode, setNanoMode] = useState(false);
    const [nanoFile, setNanoFile] = useState("");
    const [nanoContent, setNanoContent] = useState("");

    const inputRef = useRef(null);
    const terminalEndRef = useRef(null);

    const scrollToBottom = () => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        inputRef.current?.focus();
    }, [history]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (isPasswordMode) {
                // Handle Sudo Password
                const password = input.trim();
                setIsPasswordMode(false);
                setInput("");

                // For this portfolio, we'll use a simple password like "admin" or empty for demo
                // But let's make it look real: "dipanshu"
                if (password === "dipanshu" || password === "admin") {
                    const result = handleCommand(sudoCommand, currentPath, setHistory, setCurrentPath, vfs, setVfs, true);
                    if (result.nanoRequest) {
                        setNanoMode(true);
                        setNanoFile(result.file);
                        setNanoContent(result.content);
                    } else if (result.clear) {
                        setHistory([]);
                    } else {
                        setHistory(prev => [...prev, { type: "output", content: result.output }]);
                    }
                } else {
                    setHistory(prev => [...prev, { type: "output", content: "sudo: 1 incorrect password attempt" }]);
                }
                setSudoCommand("");
                return;
            }

            const trimmedInput = input.trim();
            const prompt = `dipanshu@dipanshu-vps:${currentPath.replace("/home/guest", "~")}$ `;
            const newHistory = [...history, { type: "input", content: `${prompt}${input}` }];

            const result = handleCommand(input, currentPath, setHistory, setCurrentPath, vfs, setVfs, false);

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
            } else {
                setHistory([...newHistory, { type: "output", content: result.output }]);
            }

            if (trimmedInput) {
                setCommandHistory([trimmedInput, ...commandHistory]);
            }
            setInput("");
            setHistoryIndex(-1);
        } else if (e.key === "ArrowUp") {
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
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
                    const match = dir.children.find(c => c.startsWith(partial));
                    if (match) {
                        parts[parts.length - 1] = match;
                        setInput(parts.join(" "));
                    }
                }
            }
        }
    };

    const handleNanoKeyDown = (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();

            // Save file
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
            const absoluteLines = nanoContent.split('\n').length;
            setHistory(prev => [...prev, { type: "output", content: `[Wrote ${absoluteLines} lines to ${nanoFile}]` }]);

            // Re-focus terminal input after exiting
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    };

    return (
        <div className="terminal-container" onClick={() => !nanoMode && inputRef.current?.focus()}>
            {nanoMode ? (
                <div className="nano-container">
                    <div className="nano-header">
                        <span>GNU nano 7.2</span>
                        <span>File: {nanoFile}</span>
                        <span></span>
                    </div>
                    <textarea
                        className="nano-textarea"
                        value={nanoContent}
                        onChange={(e) => setNanoContent(e.target.value)}
                        onKeyDown={handleNanoKeyDown}
                        autoFocus
                    />
                    <div className="nano-footer">
                        <span>^X Exit (Auto-Saves)</span>
                    </div>
                </div>
            ) : (
                <div className="terminal-body scrollbar-hidden">
                    {history.map((line, index) => (
                        <div key={index} className={`line ${line.type}`}>
                            {line.content}
                        </div>
                    ))}
                    <div className="input-line">
                        {!isPasswordMode && (
                            <span className="prompt">
                                dipanshu@dipanshu-vps:{currentPath.replace("/home/guest", "~")}$
                            </span>
                        )}
                        <input
                            ref={inputRef}
                            type={isPasswordMode ? "password" : "text"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                    <div ref={terminalEndRef} />
                </div>
            )}
            <div className="terminal-overlay"></div>
        </div>
    );
};

export default Terminal;
