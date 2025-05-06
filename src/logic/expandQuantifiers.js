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
                    // {n,}
                    output.push({ type: 'operator', value: '*' });
                    output.push(last);
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