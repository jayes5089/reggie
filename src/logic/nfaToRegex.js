export function convertNFAtoRegex(nfaStart) {
    const allStates = collectStates(nfaStart);
    const start = nfaStart;
    const accept = [...allStates].find(s => s.isAccepting);

    const stateIds = Array.from(allStates).map(s => s.id);
    const transitions = {};

    for (const s1 of allStates) {
        transitions[s1.id] = {};
        for (const [symbol, targets] of s1.transitions.entries()) {
            for (const s2 of targets) {
                const label = symbol === 'ε' ? 'ε' : symbol;
                const prev = transitions[s1.id][s2.id];
                transitions[s1.id][s2.id] = prev
                    ? `(${prev}|${label})`
                    : label;
            }
        }
    }
    const stateList = stateIds.filter(id => id !== start.id && id !== accept.id);

    for (const k of stateList) {
        const loop = transitions[k]?.[k] ? `(${transitions[k][k]})*` : "";

        for (const i of stateIds) {
            if (i === k || !transitions[i]) continue;
            for (const j of stateIds) {
                if (j === k || !transitions[k] || !transitions[k][j]) continue;

                const ik = transitions[i][k];
                const kj = transitions[k][j];
                if (!ik || !kj) continue;

                const old = transitions[i][j] || "";
                const mid = `${ik}${loop}${kj}`;
                transitions[i][j] = old ? `(${old}|${mid})` : mid;
            }
        }
        for (const i of stateIds) delete transitions[i]?.[k];
        delete transitions[k];
    }
    const finalRegex = transitions[start.id]?.[accept.id] || "";
    return cleanRegex(finalRegex);
}

function collectStates(start) {
    const visited = new Set();
    const stack = [start];
    while (stack.length > 0) {
        const state = stack.pop();
        if (visited.has(state)) continue;
        visited.add(state);
        for (const targets of state.transitions.values()) {
            for (const t of targets) stack.push(t);
        }
    }
    return visited;
}

function cleanRegex(r) {
    return r.replace(/\bε\b/g, "").replace(/\(([^|()]+)\)/g, "$1");
}