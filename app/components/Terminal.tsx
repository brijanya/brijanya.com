'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { COMMAND_REGISTRY } from './commandRegistry';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface HistoryEntry {
    id: string;
    prompt?: string;
    command?: string;
    output?: React.ReactNode;
}

interface InteractiveProcess {
    prompt: string;
    isPassword?: boolean;
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
}

export default function Terminal() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [viewerDoc, setViewerDoc] = useState<{ title: string; content: React.ReactNode } | null>(null);
    const [interactiveProcess, setInteractiveProcess] = useState<InteractiveProcess | null>(null);
    const [userPrompt, setUserPrompt] = useState('visitor@brijanya:~$');

    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (session?.user?.name) {
            setUserPrompt(`${session.user.name}@brijanya:~$`);
        } else {
            setUserPrompt('visitor@brijanya:~$');
        }
    }, [session]);

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

    const requestInput = (prompt: string, isPassword?: boolean): Promise<string> => {
        return new Promise((resolve, reject) => {
            setInteractiveProcess({ prompt, isPassword, resolve, reject });
        });
    };

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();

        const newHistoryEntry: HistoryEntry = {
            id: Math.random().toString(36).substring(7),
            prompt: userPrompt,
            command: cmd,
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
            
            // Add the command entry to history immediately
            setHistory((prev) => [...prev, newHistoryEntry]);

            const output = command.execute(args.slice(1), {
                setViewerDoc,
                clearHistory: () => { cleared = true; },
                navigate: (path: string) => router.push(path),
                requestInput
            });

            if (cleared) {
                setHistory([]);
                return;
            }

            if (output instanceof Promise) {
                output.then((resolvedOutput) => {
                    if (resolvedOutput) {
                        setHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), output: resolvedOutput }]);
                    }
                }).catch(() => {
                    setHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), output: <span className="text-red-400">Error executing command.</span> }]);
                });
                return;
            }

            if (output) {
                setHistory((prev) => [...prev, { id: Math.random().toString(36).substring(7), output: output as React.ReactNode }]);
            }
        } else {
            newHistoryEntry.output = <p className="text-red-400">Command not found: {baseCmd}. Type &apos;help&apos; for available commands.</p>;
            setHistory((prev) => [...prev, newHistoryEntry]);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Only allow interrupting interactive process with Ctrl+C logic if wanted, but for now just input.
        if (e.key === 'Enter') {
            const currentInput = input;

            if (interactiveProcess) {
                setHistory((prev) => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    prompt: interactiveProcess.prompt,
                    command: interactiveProcess.isPassword ? '*'.repeat(currentInput.length) : currentInput
                }]);
                
                interactiveProcess.resolve(currentInput);
                setInput('');
                setHistoryIndex(-1);
                setInteractiveProcess(null);
                return;
            }

            executeCommand(currentInput);

            if (currentInput.trim()) {
                setCommandHistory((prev) => [...prev, currentInput]);
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
                setHistory((prev) => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    prompt: userPrompt,
                    command: input,
                }, {
                    id: Math.random().toString(36).substring(7),
                    output: <p className="text-gray-400">{matches.join('  ')}</p>,
                }]);
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
                        {(entry.prompt !== undefined || entry.command !== undefined) && (
                            <div className="flex items-center gap-2">
                                {entry.prompt && <span className="text-green-400 font-bold">{entry.prompt}</span>}
                                <span>{entry.command}</span>
                            </div>
                        )}
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
                <span className="text-green-400 font-bold shrink-0">{interactiveProcess ? interactiveProcess.prompt : userPrompt}</span>
                <input
                    ref={inputRef}
                    type={interactiveProcess?.isPassword ? "password" : "text"}
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
