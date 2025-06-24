import React, { useState } from 'react';
import NFAVisualizer from '../NFAVisualizer';
import NFAtable from '../NFAtable';
import { graphToNFA } from '../../logic/nfaBuilder';
import { convertNFAtoDFA, minimizeDFA } from '../../logic/dfaUtils';
import { visualizeDFA } from '../../logic/automataVisuals';

export default function NFAtoDFA() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [dfaGraph, setDfaGraph] = useState(null);

  const handleConvert = () => {
    try {
      const { start } = graphToNFA(graph);
      const dfa = convertNFAtoDFA(start);
      const visual = visualizeDFA(dfa);
      setDfaGraph(visual);
    } catch (err) {
      console.error('NFA to DFA failed:', err);
      alert('Conversion failed. Please check the NFA.');
    }
  };

  const handleMinimize = () => {
    try {
      const { start } = graphToNFA(graph);
      const dfa = convertNFAtoDFA(start);
      const minimized = minimizeDFA(dfa);
      const visual = visualizeDFA(minimized);
      setDfaGraph(visual);
    } catch (err) {
      console.error('Minimization failed:', err);
      alert('Minimization failed. Please check the NFA.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">NFA Input</h2>
        <NFAVisualizer graph={graph} onGraphUpdate={setGraph} />
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleConvert}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Convert to DFA
          </button>
          <button
            onClick={handleMinimize}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Minimize DFA
          </button>
        </div>
      </div>

      {dfaGraph && (
        <div>
          <h2 className="text-xl font-bold mt-6 mb-2">DFA Visualization</h2>
          <NFAVisualizer graph={dfaGraph} onGraphUpdate={() => {}} />
          <NFAtable graph={dfaGraph} />
        </div>
      )}
    </div>
  );
}