const SPECIAL_CHARS = ['|', '*', '+', '?', '(', ')', '[', ']', '.', '\\'];

export function tokenize(regex) {
  const tokens = [];
  let i = 0;

  while (i < regex.length) {
    const char = regex[i];

    if (char === '\\') {
      if (i + 1 < regex.length) {
        tokens.push({ type: 'escape', value: '\\' + regex[i + 1] });
        i += 2;
      } else {
        throw new Error('Incomplete escape sequence at end of regex');
      }
      continue;
    }

    if (char === '[') {
      let range = char;
      i++;
      while (i < regex.length && regex[i] !== ']') {
        range += regex[i++];
      }
      if (i < regex.length) range += regex[i++];
      tokens.push({ type: 'charclass', value: range });
      continue;
    }

    if (SPECIAL_CHARS.includes(char)) {
      tokens.push({ type: 'operator', value: char });
      i++;
      continue;
    }

    tokens.push({ type: 'literal', value: char });
    i++;
  }
  return tokens;
}

export function expandQuantifiers(tokens) {
  const output = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'operator' && /^\{\d+(,\d*)?\}$/.test(token.value)) {
      const [n, m] = token.value
        .slice(1, -1)
        .split(',')
        .map(v => (v ? parseInt(v) : undefined));

      const last = output.pop();
      if (!last) throw new Error('Quantifier must follow a token');

      if (m === undefined) {
        for (let j = 0; j < n; j++) output.push(last);
        if (token.value.endsWith(',')) {
          output.push(last);
          output.push({ type: 'operator', value: '*' });
        }
      } else {
        for (let j = 0; j < n; j++) output.push(last);
        for (let j = 0; j < m - n; j++) {
          output.push(last);
          output.push({ type: 'operator', value: '?' });
        }
      }
    } else {
      output.push(token);
    }
  }
  return output;
}

const precedence = {
  '*': 3,
  '+': 3,
  '?': 3,
  '.': 2,
  '|': 1,
};

export function insertConcatOperators(tokens) {
  const output = [];
  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const prev = tokens[i - 1];
    output.push(curr);

    if (!curr) continue;

    const canConcat =
      prev &&
        (prev.type === 'literal' || prev.type === 'escape' || prev.type === 'charclass' ||
          prev.value === ')' || prev.value === '*' || prev.value === '+' || prev.value === '?') &&
        (curr.type === 'literal' || curr.type === 'escape' || curr.type === 'charclass' || curr.value === '(');

    if (canConcat) {
      output.splice(output.length - 1, 0, { type: 'operator', value: '.' });
    }
  }
  return output;
}

export function infixToPostfix(tokens) {
  const output = [];
  const stack = [];

  tokens.forEach((token) => {
    if (token.type === 'literal' || token.type === 'escape' || token.type === 'charclass') {
      output.push(token);
    } else if (token.type === 'operator') {
      const value = token.value;
      if (value === '(') {
        stack.push(token);
      } else if (value === ')') {
        while (stack.length > 0 && stack[stack.length - 1].value !== '(') {
          output.push(stack.pop());
        }
        stack.pop();
      } else {
        while (stack.length > 0 && precedence[stack[stack.length - 1].value] >= precedence[value]) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    }
  });

  while (stack.length > 0) {
    output.push(stack.pop());
  }

  return output;
}