import { EPSILON } from './nfaBuilder.js';

function epsilonClosure(states) {
  const stack = [...states];
  const closure = new Set(states);

  while (stack.length > 0) {
    const state = stack.pop();
    const epsTransitions = state.transitions.get(EPSILON);
    if (epsTransitions) {
      for (const next of epsTransitions) {
        if (!closure.has(next)) {
          closure.add(next);
          stack.push(next);
        }
      }
    }
  }
  return closure;
}

function move(states, symbol) {
  const result = new Set();
  for (const state of states) {
    const targets = state.transitions.get(symbol);
    if (targets) {
      for (const t of targets) result.add(t);
    }
  }
  return result;
}

function getStateKey(stateSet) {
  return [...stateSet].map(s => s.id).sort((a, b) => a - b).join(',');
}

export function convertNFAtoDFA(startState) {
  const dfaStates = [];
  const dfaTransitions = {};
  const stateMap = new Map();
  const symbols = new Set();

  const visited = new Set();
  const queue = [startState];
  while (queue.length > 0) {
    const state = queue.pop();
    if (visited.has(state.id)) continue;
    visited.add(state.id);
    for (const [sym, targets] of state.transitions.entries()) {
      if (sym !== EPSILON) symbols.add(sym);
      for (const t of targets) queue.push(t);
    }
  }

  const startClosure = epsilonClosure([startState]);
  const unmarked = [startClosure];
  const dfaStartKey = getStateKey(startClosure);
  stateMap.set(dfaStartKey, 0);
  dfaStates.push(startClosure);

  while (unmarked.length > 0) {
    const current = unmarked.pop();
    const currentKey = getStateKey(current);
    const currentIndex = stateMap.get(currentKey);
    dfaTransitions[currentIndex] = {};

    for (const symbol of symbols) {
      const moved = move(current, symbol);
      const closure = epsilonClosure([...moved]);
      const key = getStateKey(closure);

      if (closure.size === 0) continue;

      if (!stateMap.has(key)) {
        const newIndex = dfaStates.length;
        stateMap.set(key, newIndex);
        dfaStates.push(closure);
        unmarked.push(closure);
      }

      const targetIndex = stateMap.get(key);
      dfaTransitions[currentIndex][symbol] = targetIndex;
    }
  }

  const acceptingStates = [];
  dfaStates.forEach((dfaStateSet, idx) => {
    for (const state of dfaStateSet) {
      if (state.isAccepting) {
        acceptingStates.push(idx);
        break;
      }
    }
  });

  return {
    dfaStates,
    dfaTransitions,
    acceptingStates,
    startState: 0,
  };
}

export function minimizeDFA(dfa) {
  const { dfaStates, dfaTransitions, acceptingStates, startState } = dfa;
  const numStates = dfaStates.length;
  const distinguishable = Array.from({ length: numStates }, () => Array(numStates).fill(false));

  const isAccepting = new Array(numStates).fill(false);
  acceptingStates.forEach((idx) => (isAccepting[idx] = true));

  for (let i = 0; i < numStates; i++) {
    for (let j = 0; j < i; j++) {
      if (isAccepting[i] !== isAccepting[j]) {
        distinguishable[i][j] = true;
      }
    }
  }

  let changed;
  do {
    changed = false;
    for (let i = 0; i < numStates; i++) {
      for (let j = 0; j < i; j++) {
        if (distinguishable[i][j]) continue;

        const transI = dfaTransitions[i] || {};
        const transJ = dfaTransitions[j] || {};
        for (const symbol of Object.keys({ ...transI, ...transJ })) {
          const ti = transI[symbol];
          const tj = transJ[symbol];
          if (ti !== undefined && tj !== undefined) {
            const a = Math.max(ti, tj);
            const b = Math.min(ti, tj);
            if (distinguishable[a][b]) {
              distinguishable[i][j] = true;
              changed = true;
              break;
            }
          } else if (ti !== tj) {
            distinguishable[i][j] = true;
            changed = true;
            break;
          }
        }
      }
    }
  } while (changed);

  const groups = [];
  const groupMap = new Array(numStates).fill(-1);

  for (let i = 0; i < numStates; i++) {
    let found = false;
    for (let g = 0; g < groups.length; g++) {
      const rep = groups[g][0];
      const a = Math.max(i, rep);
      const b = Math.min(i, rep);
      if (!distinguishable[a][b]) {
        groups[g].push(i);
        groupMap[i] = g;
        found = true;
        break;
      }
    }
    if (!found) {
      groupMap[i] = groups.length;
      groups.push([i]);
    }
  }

  const newTransitions = {};
  const newAccepting = new Set();
  let newStart = groupMap[startState];

  for (let g = 0; g < groups.length; g++) {
    const rep = groups[g][0];
    const transitions = dfaTransitions[rep] || {};
    newTransitions[g] = {};
    for (const [symbol, target] of Object.entries(transitions)) {
      newTransitions[g][symbol] = groupMap[target];
    }
    if (acceptingStates.includes(rep)) {
      newAccepting.add(g);
    }
  }

  const newStates = groups.map((group) =>
    new Set(group.flatMap((idx) => [...dfaStates[idx]]))
  );

  return {
    dfaStates: newStates,
    dfaTransitions: newTransitions,
    acceptingStates: [...newAccepting],
    startState: newStart,
  };
}