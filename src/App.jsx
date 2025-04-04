import React, { useState, useEffect, useRef } from "react";
import RegexSymbolDropdown from "./components/RegexSymbolDropdown";

function App() {
  const [regexInput, setRegexInput] = useState("");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState([]);
  const [regexError, setRegexError] = useState("");

  const regexInputRef = useRef(null);

  useEffect(() => {
    if (regexInput.trim() === "") {
      setMatches([]);
      setRegexError("");
      return;
    }

    try {
      const pattern = new RegExp(regexInput, "g");
      const result = [...testString.matchAll(pattern)];
      setMatches(result);
      setRegexError("");
    } catch (err) {
      setMatches([]);
      setRegexError(err.message);
    }
  }, [regexInput, testString]);

  const insertAtCursor = (symbol) => {
    const input = regexInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const before = regexInput.slice(0, start);
    const after = regexInput.slice(end);
    const updated = before + symbol + after;

    setRegexInput(updated);

    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + symbol.length;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-purple-700 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Reggie</h1>
      </header>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Inputs */}
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Regex Input</h2>
          {/* Add Input Components Here */}
          <input
            type="text"
            ref={regexInputRef}
            value={regexInput}
            onChange={(e) => setRegexInput(e.target.value)}
            placeholder="Enter your regex..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <RegexSymbolDropdown onInsert={insertAtCursor} />
          {regexError && (
            <p className="text-red-500 mt-2 italic">
              Invalid regex: {regexError}
            </p>
          )}
        </section>
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Test String</h2>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter your test string..."
            className="w-full border border-gray-300 rounded px-3 py-2 h-32"
          ></textarea>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Match Results</h2>
            {matches.length > 0 ? (
              <ul className="list-disc pl-5">
                {matches.map((match, i) => (
                  <li key={i}>
                    Match {i + 1}: <code>{match[0]}</code> (at index {match.index})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No matches or invalid pattern.</p>
            )}
          </div>
        </section>
      </div>
      {/* Right Side - Output */}
      <section className="p-6 pb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          {/* Add match display, automata graph here */}
          <div className="text-gray-500 italic">Matches and automata will appear here.</div>
        </div>
      </section>
    </div>
  );
}

export default App;
