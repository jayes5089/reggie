import React, { useRef } from "react";

const highlightColors = [
    "bg-yellow-200",
    "bg-green-200",
    "bg-pink-200",
    "bg-blue-200",
    "bg-purple-200",
    "bg-red-200",
];

const getColorClass = (index) => highlightColors[index % highlightColors.length];

const TextHighlighter = ({ testString, matches, onChange }) => {
    const textareaRef = useRef(null);

    let lastIndex = 0;
    const segments = [];

    matches.forEach((match, i) => {
        const start = match.index;
        const end = start + match[0].length;

        if (lastIndex < start) {
            segments.push({ text: testString.slice(lastIndex, start), highlight: false });
        }

        segments.push({
            text: testString.slice(start, end),
            highlight: true,
            colorClass: getColorClass(i),
        });

        lastIndex = end;
    });

    if (lastIndex < testString.length) {
        segments.push({ text: testString.slice(lastIndex), highlight: false });
    }

    return (
        <div className="relative w-full mt-2">
            <div className="absolute inset-0 p-2 whitespace-pre-wrap break-words font-mono text-sm text-white pointer-events-none z-0">
                {segments.length > 0
                    ? segments.map((segment, idx) =>
                        segment.highlight ? (
                            <span key={idx} className={`${segment.colorClass} rounded px-1`}>{segment.text}</span>
                        ) : (
                            <span key={idx}>{segment.text}</span>
                        )
                    )
                : <span className="text-gray-500 italic">Start typing to see highlights</span>}
            </div>
            <textarea
                ref={textareaRef}
                value={testString}
                onChange={onChange}
                className="bg-black relative z-10 w-full border border-gray-300 rounded px-3 py-2 h-32 caret-black selection:bg-blue-200 font-mono resize-none"
                style={{ overflow: 'hidden' }}
            ></textarea>
        </div>
    );
};

export default TextHighlighter;