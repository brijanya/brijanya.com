import { AboutBio } from './AboutBio';

export interface CommandContext {
    setViewerDoc: (doc: { title: string; content: React.ReactNode } | null) => void;
    clearHistory: () => void;
}

export interface Command {
    name: string;
    description: string;
    hidden?: boolean;
    execute: (args: string[], context: CommandContext) => React.ReactNode | Promise<React.ReactNode>;
}

export const PROJECTS = `
1. Terminal Personal Website - A simulation of a terminal experience on the web.
2. DocTrack - A document tracking system for borrowers.
3. Trading Bot - An automated options scalper.
`;

export const CONTACT = `
Email: brijanya@outlook.com
GitHub: github.com/brijanya
LinkedIn: linkedin.com/in/brijanya
`;

export const COMMAND_REGISTRY: Record<string, Command> = {
    about: {
        name: 'about',
        description: 'Learn more about me',
        execute: (_, { setViewerDoc }) => {
            setViewerDoc({ title: 'ABOUT ME', content: <AboutBio /> });
            return <></>;
        }
    },
    projects: {
        name: 'projects',
        description: 'View my recent projects',
        hidden: true,
        execute: () => <pre className="whitespace-pre-wrap">{PROJECTS.trim()}</pre>,
    },
    contact: {
        name: 'contact',
        description: 'Get my contact information',
        execute: () => <pre className="whitespace-pre-wrap">{CONTACT.trim()}</pre>
    },
    clear: {
        name: 'clear',
        description: 'Clear the terminal screen',
        execute: (_, { clearHistory }) => {
            clearHistory();
            return <></>;
        }
    },
    help: {
        name: 'help',
        description: 'Show this help message',
        execute: () => {
            const helpText = Object.values(COMMAND_REGISTRY)
                .filter(cmd => !cmd.hidden)
                .map(cmd => `  ${cmd.name.padEnd(8)} - ${cmd.description}`)
                .join('\n');
            return <pre className="whitespace-pre-wrap">{`Available commands:\n${helpText}`}</pre>;
        }
    },
    date: {
        name: 'date',
        description: 'Show current date & time',
        execute: () => <p>{new Date().toString()}</p>
    },
    echo: {
        name: 'echo',
        description: 'Print text back to the terminal',
        execute: (args) => <p>{args.join(' ')}</p>
    },
    sudo: {
        name: 'sudo',
        description: 'Execute a command as the superuser',
        hidden: true,
        execute: () => <p className="text-red-500">Nice try... but you do not have root privileges.</p>
    },
    suggest: {
        name: 'suggest',
        description: 'Suggest a feature or a tool you would like to see on this website',
        execute: async (args) => {
            const suggestion = args.join(' ').trim();
            if (!suggestion) {
                return <p className="text-yellow-400">Please provide a suggestion. Usage: <span className="text-gray-300">suggest [your idea]</span></p>;
            }
            try {
                const res = await fetch('/api/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ suggestion })
                });

                if (res.ok) {
                    return <p className="text-green-400">Thank you for your suggestion! It has been saved and I will consider it.</p>;
                } else {
                    return <p className="text-red-400">Could not save suggestion. Please try again later.</p>;
                }
            } catch (error) {
                return <p className="text-red-400">Error connecting to the server.</p>;
            }
        }
    }
};
