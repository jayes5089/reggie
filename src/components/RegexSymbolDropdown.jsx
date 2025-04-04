import React from "react";

const regexSymbols = {
    "Character Classes": [
        { symbol: "\\d", label: "Digit (\\d)" },
        { symbol: "\\w", label: "Word (\\w)" },
        { symbol: "\\s", label: "Whitespace (\\s)" },
        { symbol: ".", label: "Any character (.)" },
        { symbol: "[^abc]", label: "Not a, b, or c ([^abc])" },
    ],
    "Quantifiers": [
        { symbol: "*", label: "Zero or more (*)" },
        { symbol: "+", label: "One or more (+)" },
        { symbol: "?", label: "Zero or one (?)" },
        { symbol: "{n}", label: "Exactly n times ({n})" },
        { symbol: "{n,}", label: "n or more times ({n,})" },
        { symbol: "{n,m}", label: "Between n and m times ({n,m})" },
    ],
    "Anchors & Assertions": [
        { symbol: "^", label: "Start of string (^)" },
        { symbol: "$", label: "End of string ($)" },
        { symbol: "(?=...)", label: "Lookahead (?=...)" },
        { symbol: "(?!...)", label: "Negative Lookahead (?!...)" },
        { symbol: "\\b", label: "Word Boundary (\\b)" },
    ],
    "Grouping & Alternation": [
        { symbol: "()", label: "Capturing group ( )" },
        { symbol: "(?:)", label: "Non-capturing group (?: )" },
        { symbol: "|", label: "Alternation (|)" },
        { symbol: "[]", label: "Character set [ ]" },
        { symbol: "a-z", label: "Range a to z" },
    ],
};

const RegexSymbolDropdown = ({ onInsert }) => {
    const handleChange = (e) => {
        const value = e.target.value;
        if (value) {
            onInsert(value);
            e.target.selectedIndex = 0;
        }
    };

    return (
        <select
            onChange={handleChange}
            className="mt-2 mb-4 w-full md:w-auto border border-gray-300 rounded px-2 py-1"
        >
            <option value="">Insert Regex Symbol...</option>
            {Object.entries(regexSymbols).map(([category, symbols]) => (
                <optgroup key={category} label={category}>
                    {symbols.map((item, idx) => (
                        <option key={idx} value={item.symbol}>
                            {item.label}
                        </option>
                    ))}
                </optgroup>
            ))}
        </select>
    );
};

export default RegexSymbolDropdown;