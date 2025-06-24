import React, { useState } from 'react';
import RegexSymbolDropdown from '../RegexSymbolDropdown';
import RegexExplanation from '../RegexExplanation';
import TextHighlighter from '../TextHighlighter';
import NFAVisualizer from '../NFAVisualizer';
import NFAtable from '../NFAtable';
import {
  tokenize,
  expandQuantifiers,
  insertConcatOperators,
  infixToPostfix,
} from '../../logic/tokenizer';
import { buildNFA, resetStateIds } from '../../logic/nfaBuilder';
import { visualizeNFA } from '../../logic/automataVisuals';

export default function RegexToFA() {
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [graph, setGraph] = useState(null);

  const handleConvert = () => {
    try {
      resetStateIds();
      const tokens = tokenize(regex);
      const expanded = expandQuantifiers(tokens);
      const withConcat = insertConcatOperators(expanded);
      const postfix = infixToPostfix(withConcat);
      const nfa = buildNFA(postfix);
      const visual = visualizeNFA(nfa.start);
      setGraph(visual);
    } catch (err) {
      console.error('Regex parse error:', err.message);
      alert('Error parsing regex. Please check your input.');
    }
  };

  const handleInsertSymbol = (symbol) => {
    setRegex(prev => prev + symbol);
  };

  const matchRegex = () => {
    try {
      const re = new RegExp(regex, 'g');
      const matches = [...testString.matchAll(re)];
      return matches;
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6 text-green-400 font-mono">
      <div>
        <label className="text-yellow-400 block font-semibold">Enter Regular Expression:</label>
        <input
          type="text"
          value={regex}
          onChange={e => setRegex(e.target.value)}
          className="w-full bg-black border border-green-700 rounded px-2 py-1 text-green-300 focus:outline-none focus:ring focus:ring-yellow-400"
        />
        <RegexSymbolDropdown onInsert={handleInsertSymbol} className="bg-black" />
        <button
          onClick={handleConvert}
          className="mt-2 bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-300 transition"
        >
          Convert to NFA
        </button>
        <RegexExplanation regex={regex} />
      </div>

      <div>
        <label className="text-yellow-400 block font-semibold">Test String:</label>
        <TextHighlighter
          className="bg-[#1f1f1f]"
          testString={testString}
          matches={matchRegex()}
          onChange={(e) => setTestString(e.target.value)}
        />
      </div>

      <div>
        <h2 className="text-yellow-400 text-xl font-bold mb-2">NFA Visualization:</h2>
        {graph && (
          <>
            <NFAVisualizer graph={graph} onGraphUpdate={setGraph} />
            <NFAtable graph={graph} />
          </>
        )}
      </div>
    </div>
  );
}
