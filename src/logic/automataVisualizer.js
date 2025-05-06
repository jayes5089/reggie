export function visualizeNFA(startState) {
    const visited = new Set();
    const nodes = [];
    const edges = [];
    const queue = [startState];

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current.id)) continue;
        visited.add(current.id);

        nodes.push({
            data: { id: `q${current.id}`, label: `q${current.id}` },
        });

        for (const [symbol, targets] of current.transitions.entries()) {
            for (const target of targets) {
                edges.push({
                    data: {
                        source: `q${current.id}`,
                        target: `q${target.id}`,
                        label: symbol,
                    },
                });
                if (!visited.has(target.id)) {
                    queue.push(target);
                }
            }
        }
    }
    return { nodes, edges };
}