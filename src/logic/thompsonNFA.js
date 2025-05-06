  let stateId = 0;
  const EPSILON = 'ε';

  class State {
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

  class Fragment {
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

  export { State, Fragment, EPSILON };