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

    const newStates = groups.map((group, i) => new Set(group.flatMap(idx => [...dfaStates[idx]])));

    return {
        dfaStates: newStates,
        dfaTransitions: newTransitions,
        acceptingStates: [...newAccepting],
        startState: newStart,
    };
}