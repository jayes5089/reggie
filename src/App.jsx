import React, { useState, useEffect, useRef } from "react";
import reggielogo from './assets/reggielogo.svg';
import RegexSymbolDropdown from "./components/RegexSymbolDropdown";
import RegexExplanation from "./components/RegexExplanation";
import TextHighlighter from "./components/TextHighlighter";
import { tokenize } from './logic/tokenizer';
import { insertConcatOperators, infixToPostfix } from './logic/infixToPostfix';
import { buildNFA, resetStateIds } from "./logic/thompsonNFA";
import { visualizeNFA } from "./logic/automataVisualizer";
import NFAtable from "./components/NFAtable";
import NFAVisualizer from "./components/NFAVisualizer";
import { expandQuantifiers } from './logic/expandQuantifiers';
import { convertNFAtoDFA } from "./logic/NFAtoDFA";
import { visualizeDFA } from "./logic/visualizeDFA";
import { minimizeDFA } from "./logic/minimizeDFA";

function App() {
  const [regexInput, setRegexInput] = useState("");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState([]);
  const [regexError, setRegexError] = useState("");
  const [tokens, setTokens] = useState ([]);
  const [postfixTokens, setPostfixTokens] = useState([]);
  const [nfaGraph, setNfaGraph] = useState(null);
  const [dfaGraph, setDfaGraph] = useState(null);
  const [viewMode, setViewMode] = useState("nfa");

  const regexInputRef = useRef(null);

  useEffect(() => {
    if (regexInput.trim() === "") {
      setMatches([]);
      setRegexError("");
      setNfaGraph(null);
      return;
    }

    try {
      const pattern = new RegExp(regexInput, "g");
      const result = [...testString.matchAll(pattern)];
      setMatches(result);
      setRegexError("");

      const tokenList = tokenize(regexInput);
      setTokens(tokenList);

      const expanded = expandQuantifiers(tokenList);
      const withConcat = insertConcatOperators(expanded);
      const postfix = infixToPostfix(withConcat);
      setPostfixTokens(postfix);

      resetStateIds();
      const nfa = buildNFA(postfix);
      const visualNFA = visualizeNFA(nfa.start);
      setNfaGraph(visualNFA);

      const dfa = convertNFAtoDFA(nfa.start);
      const minimized = minimizeDFA(dfa);
      const visualDFA = visualizeDFA(minimized);
      setDfaGraph(visualDFA);
    } catch (err) {
      setMatches([]);
      setRegexError(err.message);
      setTokens([]);
      setPostfixTokens([]);
      setNfaGraph(null);
      setDfaGraph(null);
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
    <div className="min-h-screen bg-main">
      {/* Header */}
      <header className="bg-header px-3 py-4 shadow-md">
        <img src={reggielogo} alt="logo" className="h-10 w-auto" />
      </header>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Inputs */}
        <section className="bg-gray-400 rounded-2xl shadow p-4">
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
          <RegexExplanation regex={regexInput} />
          {tokens.length > 0 && (
            <div className="mt-2 p-3 border rounded bg-gray-50 text-sm">
              <h3 className="font-semibold mb-1">Tokenized Regex</h3>
              <div className="flex flex-wrap gap-2">
                {tokens.map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {t.type}: <code>{t.value}</code>
                  </span>
                ))}
              </div>
            </div>
          )}
          {postfixTokens.length > 0 && (
            <div className="mt-2 p-3 border rounded bg-gray-50 text-sm">
              <h3 className="font-semibold mb-1">Postfix Expression</h3>
              <div className="flex flex-wrap gap-2">
                {postfixTokens.map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-green-100 text-green-800">
                    {t.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {regexError && (
            <p className="text-red-500 mt-2 italic">
              Invalid regex: {regexError}
            </p>
          )}
        </section>
        <section className="bg-gray-400 rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Test String:</h2>
          <TextHighlighter
            testString={testString}
            matches={matches}
            onChange={(e) => setTestString(e.target.value)}
            className="bg-main"
          />
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Match Results:</h2>
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
        <div className="bg-gray-400 rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <div className="flex gap-2 mb-4">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'nfa' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('nfa')}
            >
              Show NFA
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'dfa' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('dfa')}
            >
              Show DFA
            </button>
          </div>
          <div>
            {viewMode === 'nfa' && nfaGraph && (
              <>
                <NFAtable graph={nfaGraph} />
                <NFAVisualizer graph={nfaGraph} />
              </>
            )}
            {viewMode === 'dfa' && dfaGraph && (
              <>
                <NFAtable graph={dfaGraph} />
                <NFAVisualizer graph={dfaGraph} />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;