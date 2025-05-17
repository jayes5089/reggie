import React, { useState } from 'react';
import NFAVisualizer from '../NFAVisualizer';
import { convertNFAtoRegex } from '../../logic/nfaToRegex';
import { graphToNFA } from '../../logic/nfaBuilder';

export default function FAToRegex() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [result, setResult] = useState('');

  const handleConvert = () => {
    try {
      const { start, states } = graphToNFA(graph.nodes.concat(graph.edges));
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
        <h2 className="text-xl font-bold mb-2">NFA Input</h2>
        <NFAVisualizer graph={graph} onGraphUpdate={setGraph} />
        <button
          onClick={handleConvert}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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
