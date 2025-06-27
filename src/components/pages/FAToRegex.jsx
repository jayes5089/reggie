import React, { useState } from 'react';
import NFAVisualizer from '../NFAVisualizer';
import { convertNFAtoRegex } from '../../logic/nfaToRegex';
import { graphToNFA } from '../../logic/nfaBuilder';

export default function FAToRegex() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('nfa');

  const handleConvert = () => {
    try {
      const { start, states } = graphToNFA(graph);
      const regex = convertNFAtoRegex(start, states);
      setResult(regex);
    } catch (err) {
      console.error('Conversion failed:', err);
      alert('Conversion failed. Please check the NFA structure.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 space-x-2">
          <button
            className={`px-2 py-1 rounded ${mode === 'nfa' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
            onClick={() => setMode('nfa')}
          >
            NFA Mode
          </button>
          <button
            className={`px-2 py-1 rounded ${mode === 'dfa' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
            onClick={() => setMode('dfa')}
          >
            DFA Mode
          </button>
        </div>

        <h2 className="text-xl font-bold mb-2">{mode.toUpperCase()} Input</h2>
        <NFAVisualizer graph={graph} onGraphUpdate={setGraph} mode={mode} />
        <button
          onClick={handleConvert}
          className="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Convert to Regex
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <label className="block font-semibold">Generated Regex:</label>
          <div className="p-2 bg-zinc-800 rounded text-green-400">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
