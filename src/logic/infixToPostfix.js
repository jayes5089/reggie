const precedence = {
    '*': 3,
    '+': 3,
    '?': 3,
    '.': 2,
    '|': 1,
};

const isOperator = (token) => token.type === 'operator';

export function insertConcatOperators(tokens) {
    const output = [];
    for (let i = 0; i < tokens.length; i++) {
        const curr = tokens[i];
        const prev = tokens[i - 1];
        output.push(curr);

        if (!curr) continue;

        const canConcat =
            (prev &&
                (prev.type === 'literal' || prev.type === 'escape' || prev.type === 'charclass' || prev.value === ')' || prev.value === '*') &&
                (curr.type === 'literal' || curr.type === 'escape' || curr.type === 'charclass' || curr.value === '(')
            );
        
        if (canConcat) {
            output.splice(output.length - 1, 0, { type: 'operator', value: '.'});
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
                while (
                    stack.length > 0 &&
                    precedence[stack[stack.length - 1].value] >= precedence[value]
                ) {
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