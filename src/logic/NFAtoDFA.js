import { EPSILON } from './thompsonNFA';

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

function getStateKey(stateSet) {
    return [...stateSet].map(s => s.id).sort((a, b) => a - b).join(',');
}