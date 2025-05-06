import React from "react";

const NFAtable = ({ graph }) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return null;

    const rows = graph.edges.map((edge, idx) => ({
        from: edge.data.source,
        symbol: edge.data.label,
        to: edge.data.target,
        key: idx,
    }));

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">NFA State Transitions:</h3>
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr className="bg-header text-white">
                        <th className="border px-2 py-1">From</th>
                        <th className="border px-2 py-1">Symbol</th>
                        <th className="border px-2 py-1">To</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.key} className="text-center bg-white">
                            <td className="border px-2 py-1">{row.from}</td>
                            <td className="border px-2 py-1">{row.symbol}</td>
                            <td className="border px-2 py-1">{row.to}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NFAtable;