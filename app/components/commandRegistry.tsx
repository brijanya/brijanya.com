import { AboutBio } from './AboutBio';
import { authClient } from '@/lib/auth-client';

export interface CommandContext {
    setViewerDoc: (doc: { title: string; content: React.ReactNode } | null) => void;
    clearHistory: () => void;
    navigate: (path: string) => void;
    requestInput: (prompt: string, isPassword?: boolean) => Promise<string>;
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
    },
    navigate: {
        name: 'navigate',
        description: 'Navigate to a different page',
        execute: (args, { navigate }) => {
            const page = args.join(' ').trim();
            if (!page) {
                return <p className="text-yellow-400">Please provide a page. Usage: <span className="text-gray-300">navigate [page]</span></p>;
            }
            navigate(page);
            return <p>Redirecting to {page}...</p>;
        }
    },
    signup: {
        name: 'signup',
        description: 'Create a new account',
        execute: async (_, { requestInput }) => {
            try {
                const name = await requestInput('Username: ');
                const email = await requestInput('Email: ');
                const password = await requestInput('Password: ', true);

                if (!name || !email || !password) {
                    return <p className="text-red-400">Signup cancelled: All fields are required.</p>;
                }

                const { data, error } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                });

                if (error) {
                    return <p className="text-red-400">Signup failed: {error.message}</p>;
                }

                return <p className="text-green-400">Successfully signed up and logged in as {name}!</p>;
            } catch (err) {
                return <p className="text-red-400">An unexpected error occurred during signup.</p>;
            }
        }
    },
    login: {
        name: 'login',
        description: 'Log into your account',
        execute: async (_, { requestInput }) => {
            try {
                const email = await requestInput('Email: ');
                const password = await requestInput('Password: ', true);

                if (!email || !password) {
                    return <p className="text-red-400">Login cancelled: Email and password are required.</p>;
                }

                const { data, error } = await authClient.signIn.email({
                    email,
                    password,
                });

                if (error) {
                    return <p className="text-red-400">Login failed: {error.message}</p>;
                }

                return <p className="text-green-400">Successfully logged in! Welcome back, {data?.user.name}.</p>;
            } catch (err) {
                return <p className="text-red-400">An unexpected error occurred during login.</p>;
            }
        }
    },
    sudo: {
        name: 'sudo',
        description: 'Execute a command as the superuser',
        hidden: true,
        execute: async (_, { requestInput }) => {
            try {
                const password = await requestInput('Password for brijanya@outlook.com: ', true);
                if (!password) {
                    return <p className="text-red-400">Sudo cancelled.</p>;
                }

                const { data, error } = await authClient.signIn.email({
                    email: 'brijanya@outlook.com',
                    password,
                });

                if (error) {
                    return <p className="text-red-400">Authentication failure: Sorry, try again.</p>;
                }

                return <p className="text-green-400">Authenticated successfully as superuser.</p>;
            } catch (err) {
                return <p className="text-red-400">An unexpected error occurred.</p>;
            }
        }
    },
    logout: {
        name: 'logout',
        description: 'Log out of your account',
        execute: async () => {
            const { error } = await authClient.signOut();
            if (error) {
                return <p className="text-red-400">Logout failed: {error.message}</p>;
            }
            return <p className="text-green-400">Successfully logged out.</p>;
        }
    }
};
