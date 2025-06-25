import React from 'react';

export default function AutomataInfoPanel({ graph }) {
    if (!graph) return null
    const { nodes = [], edges = [], startNodeId } = graph
    const states = nodes.map(n => n.id)

    const alphabetSet = new Set()
    edges.forEach(e => {
        if (!e.label) return
        e.label.split(',').map(s => s.trim()).forEach(sym => {
            if (sym && sym !== 'ε') alphabetSet.add(sym)
        })
    })
    const alphabet = Array.from(alphabetSet)
    const finals = nodes.filter(n => n.isAccept).map(n => n.id)

    return (
        <div className="bg-black border border-green-700 text-green-200 p-2 w-60 text-sm">
            <h3 className="font-bold mb-2">Automaton Info</h3>
            <p><span className="font-bold">Q</span> = {'{ ' + states.join(', ') + ' }'}</p>
            <p><span className="font-bold">Σ</span> = {'{ ' + alphabet.join(', ') + ' }'}</p>
            <p><span className="font-bold">q</span> = {startNodeId ?? ''}</p>
            <p><span className="font-bold">F</span> = {'{ ' + finals.join(', ') + ' }'}</p>
            <div className="mt-2">
                <span className="font-bold">δ</span>:
                <ul className="list-disc list-inside">
                    {edges.map((e, idx) => (
                        <li key={idx}>δ({e.from}, {e.label || 'ε'}) = {e.to}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}