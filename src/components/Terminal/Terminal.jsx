import React, { useState, useRef, useEffect } from "react";
import "./Terminal.css";
import { handleCommand } from "./commands";

const Terminal = () => {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([
        { type: "output", content: "Last login: " + new Date().toUTCString() + " on ttys001" },
        { type: "output", content: "System: Portfolio Linux 1.0.4 - Zsh on macOS style shell" },
        { type: "output", content: 'Type "help" for a list of available commands.' },
    ]);
    const [currentPath, setCurrentPath] = useState("/home/dipanshu");
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

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
            const trimmedInput = input.trim();
            const newHistory = [...history, { type: "input", content: `dipanshu@Macbook-Pro:${currentPath.replace("/home/dipanshu", "~")}$ ${input}` }];

            const result = handleCommand(input, currentPath, setHistory, setCurrentPath);

            if (result.clear) {
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
                    <span className="prompt">
                        dipanshu@Macbook-Pro:{currentPath.replace("/home/dipanshu", "~")}$
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
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
