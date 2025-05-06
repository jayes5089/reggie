export function visualizeDFA(dfa) {
    const nodes = [];
    const edges = [];

    for (let i = 0; i < dfa.dfaStates.length; i++) {
        nodes.push({
            data: {
                id: `D${i}`,
                label: `D${i}`,
            },
            classes: i === dfa.startState ? 'start' : dfa.acceptingStates.includes(i) ? 'accepting' : '',
        });

        const transitions = dfa.dfaTransitions[i];
        for (const symbol in transitions) {
            edges.push({
                data: {
                    source: `D${i}`,
                    target: `D${transitions[symbol]}`,
                    label: symbol,
                },
            });
        }
    }

    return { nodes, edges };
}