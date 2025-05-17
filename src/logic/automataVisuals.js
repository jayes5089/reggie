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
      id: `q${current.id}`,
      label: `q${current.id}`,
      x: 100 + (current.id % 5) * 120,
      y: 100 + Math.floor(current.id / 5) * 120,
      isAccept: current.isAccepting || false
    });

    for (const [symbol, targets] of current.transitions.entries()) {
      for (const target of targets) {
        edges.push({
          from: `q${current.id}`,
          to: `q${target.id}`,
          label: symbol,
        });
        if (!visited.has(target.id)) {
          queue.push(target);
        }
      }
    }
  }
  return { nodes, edges };
}

export function visualizeDFA(dfa) {
  const { dfaStates, dfaTransitions, acceptingStates, startState } = dfa;
  const nodes = [];
  const edges = [];

  for (let i = 0; i < dfaStates.length; i++) {
    nodes.push({
      id: `D${i}`,
      label: `D${i}`,
      x: 120 + (i % 6) * 120,
      y: 120 + Math.floor(i / 6) * 120,
      isAccept: acceptingStates.includes(i),
    });

    const transitions = dfaTransitions[i];
    for (const symbol in transitions) {
      edges.push({
        from: `D${i}`,
        to: `D${transitions[symbol]}`,
        label: symbol,
      });
    }
  }

  return { nodes, edges };
}