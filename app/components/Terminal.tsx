'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { COMMAND_REGISTRY } from './commandRegistry';

interface CommandOutput {
    id: string;
    command: string;
    output: React.ReactNode;
}

export default function Terminal() {
    const [history, setHistory] = useState<CommandOutput[]>([]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [viewerDoc, setViewerDoc] = useState<{ title: string; content: React.ReactNode } | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input automatically and when clicking anywhere on the terminal container
    useEffect(() => {
        if (!viewerDoc) {
            inputRef.current?.focus();
        }
    }, [viewerDoc]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();

        const newHistoryEntry: CommandOutput = {
            id: Math.random().toString(36).substring(7),
            command: cmd,
            output: '',
        };

        if (!trimmedCmd) {
            setHistory((prev) => [...prev, newHistoryEntry]);
            return;
        }

        const args = trimmedCmd.split(' ');
        const baseCmd = args[0].toLowerCase();

        const command = COMMAND_REGISTRY[baseCmd];

        if (command) {
            let cleared = false;
            const output = command.execute(args.slice(1), {
                setViewerDoc,
                clearHistory: () => { cleared = true; }
            });

            if (cleared) {
                setHistory([]);
                return;
            }

            if (output instanceof Promise) {
                newHistoryEntry.output = <span className="text-gray-400 animate-pulse">Running...</span>;
                setHistory((prev) => [...prev, newHistoryEntry]);

                output.then((resolvedOutput) => {
                    setHistory(prev => prev.map(entry => entry.id === newHistoryEntry.id ? { ...entry, output: resolvedOutput } : entry));
                }).catch(() => {
                    setHistory(prev => prev.map(entry => entry.id === newHistoryEntry.id ? { ...entry, output: <span className="text-red-400">Error executing command.</span> } : entry));
                });
                return;
            }

            newHistoryEntry.output = output as React.ReactNode;
        } else {
            newHistoryEntry.output = <p className="text-red-400">Command not found: {baseCmd}. Type &apos;help&apos; for available commands.</p>;
        }

        setHistory((prev) => [...prev, newHistoryEntry]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const currentCmd = input;
            executeCommand(currentCmd);

            if (currentCmd.trim()) {
                setCommandHistory((prev) => [...prev, currentCmd]);
            }
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(nextIndex);
                setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentInput = input.trim().toLowerCase();
            if (!currentInput) return;

            const availableCommands = Object.values(COMMAND_REGISTRY)
                .filter(cmd => !cmd.hidden)
                .map(cmd => cmd.name);
            const matches = availableCommands.filter((cmd) => cmd.startsWith(currentInput));

            if (matches.length === 1) {
                setInput(matches[0]);
            } else if (matches.length > 1) {
                const newHistoryEntry: CommandOutput = {
                    id: Math.random().toString(36).substring(7),
                    command: input,
                    output: <p className="text-gray-400">{matches.join('  ')}</p>,
                };
                setHistory((prev) => [...prev, newHistoryEntry]);
            }
        }
    };

    if (viewerDoc) {
        return (
            <DocumentViewer
                title={viewerDoc.title}
                content={viewerDoc.content}
                onClose={() => setViewerDoc(null)}
            />
        );
    }

    return (
        <div
            className="w-full h-full min-h-screen p-4 md:p-8 cursor-text text-sm md:text-base leading-relaxed tracking-wide"
            onClick={handleContainerClick}
        >
            {/* Intro text */}
            <div className="mb-6 opacity-80">
                <p className="text-green-500 font-bold mb-2">brijanya.com | terminal</p>
                <p>Type <span className="text-yellow-400">&apos;help&apos;</span> to see available commands.</p>
                <p>--------------------------------------------------</p>
            </div>

            {/* History Output */}
            <div className="flex flex-col gap-3 mb-3">
                {history.map((entry) => (
                    <div key={entry.id} className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold">visitor@brijanya:~$</span>
                            <span>{entry.command}</span>
                        </div>
                        {entry.output && (
                            <div className="mt-1 text-gray-300 ml-2">
                                {entry.output}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Current Input */}
            <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold shrink-0">visitor@brijanya:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent outline-none border-none flex-grow text-gray-100 min-w-0"
                    spellCheck={false}
                    autoComplete="off"
                    autoFocus
                />
            </div>

            {/* Invisible element to auto-scroll to */}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
}
