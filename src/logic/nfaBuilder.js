// nfaBuilder.js (merged: thompsonNFA.js + graphToNFA.js)

let stateId = 0;
export const EPSILON = 'ε';

export class State {
  constructor() {
    this.id = stateId++;
    this.transitions = new Map();
  }
  addTransition(symbol, state) {
    if (!this.transitions.has(symbol)) {
      this.transitions.set(symbol, new Set());
    }
    this.transitions.get(symbol).add(state);
  }
}

export class Fragment {
  constructor(start, accept) {
    this.start = start;
    this.accept = accept;
  }
}

export function resetStateIds() {
  stateId = 0;
}

export function buildNFA(postfixTokens) {
  const stack = [];

  for (const token of postfixTokens) {
    if (token.type === 'literal' || token.type === 'escape' || token.type === 'charclass') {
      const s1 = new State();
      const s2 = new State();
      s1.addTransition(token.value, s2);
      stack.push(new Fragment(s1, s2));
    } else if (token.value === '.') {
      const f2 = stack.pop();
      const f1 = stack.pop();
      f1.accept.addTransition(EPSILON, f2.start);
      stack.push(new Fragment(f1.start, f2.accept));
    } else if (token.value === '|') {
      const f2 = stack.pop();
      const f1 = stack.pop();
      const s = new State();
      const a = new State();
      s.addTransition(EPSILON, f1.start);
      s.addTransition(EPSILON, f2.start);
      f1.accept.addTransition(EPSILON, a);
      f2.accept.addTransition(EPSILON, a);
      stack.push(new Fragment(s, a));
    } else if (token.value === '*') {
      const f = stack.pop();
      const s = new State();
      const a = new State();
      s.addTransition(EPSILON, f.start);
      s.addTransition(EPSILON, a);
      f.accept.addTransition(EPSILON, f.start);
      f.accept.addTransition(EPSILON, a);
      stack.push(new Fragment(s, a));
    } else if (token.value === '+') {
      const f = stack.pop();
      const s = new State();
      const a = new State();
      f.accept.addTransition(EPSILON, f.start);
      f.accept.addTransition(EPSILON, a);
      stack.push(new Fragment(f.start, a));
    } else if (token.value === '?') {
      const f = stack.pop();
      const s = new State();
      const a = new State();
      s.addTransition(EPSILON, f.start);
      s.addTransition(EPSILON, a);
      f.accept.addTransition(EPSILON, a);
      stack.push(new Fragment(s, a));
    }
  }

  const result = stack.pop();
  result.accept.isAccepting = true;
  return result;
}

export function graphToNFA(graphElements) {
  const stateMap = new Map();
  const acceptingStates = new Set();
  let startState = null;

  const nodes = graphElements.filter(el => el.id !== undefined);
  const edges = graphElements.filter(el => el.from !== undefined);

  nodes.forEach((node) => {
    const id = node.id;
    const state = new State();
    state.id = parseInt(id.replace(/\D/g, ""));
    stateMap.set(id, state);

    if (node.isAccept) acceptingStates.add(id);
    if (!startState) startState = state;
  });

  edges.forEach((edge) => {
    const fromId = edge.from;
    const toId = edge.to;
    const label = edge.label ?? edge.data?.label ?? "ε";
    const fromState = stateMap.get(fromId);
    const toState = stateMap.get(toId);

    if (!fromState || !toState) return;

    const symbols = label.split(',').map(s => s.trim()).filter(s => s.length > 0);
    for (const sym of symbols) {
      fromState.addTransition(sym === "ε" ? EPSILON : sym, toState);
    }
  });

  for (const id of acceptingStates) {
    const s = stateMap.get(id);
    if (s) s.isAccepting = true;
  }

  return {
    start: startState || stateMap.values().next().value,
    states: Array.from(stateMap.values()),
  };
}
