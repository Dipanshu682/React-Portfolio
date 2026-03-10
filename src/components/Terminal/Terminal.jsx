import React, { useState, useRef, useEffect } from "react";
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
                    if (result.clear) {
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
        }
    };

    return (
        <div className="terminal-container" onClick={() => inputRef.current?.focus()}>
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
            <div className="terminal-overlay"></div>
        </div>
    );
};

export default Terminal;
