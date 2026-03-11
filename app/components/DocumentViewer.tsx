import { useEffect, useRef } from 'react';

interface DocumentViewerProps {
    title: string;
    content: React.ReactNode;
    onClose: () => void;
}

export function DocumentViewer({ title, content, onClose }: DocumentViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        viewerRef.current?.focus();
    }, []);

    return (
        <div
            ref={viewerRef}
            className="w-full h-full min-h-screen p-4 md:p-8 cursor-default text-sm md:text-base leading-relaxed tracking-wide flex flex-col outline-none"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                }
            }}
        >
            <div className="bg-gray-200 text-black px-4 py-1 flex justify-between uppercase font-bold text-xs mb-4">
                <span>{title}</span>
                <span>Document View</span>
            </div>
            <div className="flex-grow px-4 md:px-8 py-4 text-gray-300 overflow-auto">
                {content}
            </div>
            <div className="bg-gray-200 text-black px-4 py-1 flex justify-between uppercase font-bold text-xs mt-4">
                <span>Press &apos;q&apos; or ESC to quit</span>
            </div>
        </div>
    );
}
