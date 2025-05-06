import React from "react";

const explanationMap = [
    { pattern: /\\d/g, explanation: "digit (0-9)" },
    { pattern: /\\w/g, explanation: "word character (a-z, A-Z, 0-9, _)" },
    { pattern: /\\s/g, explanation: "whitespace" },
    { pattern: /\./g, explanation: "any character except newline" },
    { pattern: /\^/g, explanation: "start of string" },
    { pattern: /\$/g, explanation: "end of string" },
    { pattern: /\*/g, explanation: "zero or more repetitions" },
    { pattern: /\+/g, explanation: "one or more repetitions" },
    { pattern: /\?/g, explanation: "zero or one repetition" },
    { pattern: /\|/g, explanation: "alternation (OR)" },
    { pattern: /\[\^?.*?\]/g, explanation: "character set" },
    { pattern: /\(\?:.*?\)/g, explanation: "non-capturing group" },
    { pattern: /\(.*?\)/g, explanation: "capturing group" },
    { pattern: /[a-z]-[a-z]/gi, explanation: "character range" },
];

const RegexExplanation = ({ regex }) => {
    if (!regex) return null;

    const explanations = [];
    let explainedRegex = regex;

    explanationMap.forEach(({ pattern, explanation }) => {
        const matches = [...explainedRegex.matchAll(pattern)];
        matches.forEach((match) => {
            explanations.push(`${match[0]} -> ${explanation}`);
        });
    });

    return (
        <div className="bg-gray-50 border rounded p-3 mt-2">
            <h3 className="font-semibold mb-1">Regex Explanation</h3>
            {explanations.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700">
                    {explanations.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                    ))}
                </ul>
            ) : (
                <p className="italic text-gray-500 text-sm">No recognizable patterns found.</p>
            )}
        </div>
    );
};

export default RegexExplanation;