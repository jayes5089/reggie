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