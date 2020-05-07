const patternRules = [
    {
        pattern: /\/\/.*/,
        type: 'comment'
    },
    {
        pattern: /"[^"]*"/,
        type: 'string'
    },
    {
        pattern: /'[^']*'/,
        type: 'string'
    }
];

const looseRules = [
    {
        patterns: [' '],
        type: 'space'
    },
    {
        patterns: ['\t'],
        type: 'tab'
    },
    {
        patterns: ['(', ')', '[', ']', '{', '}', '<', '>'],
        type: 'bracket'
    },
    {
        patterns: ['=', '!', '|', '%', '&', '^', '$', '*', '+', '-', '.', '/', ',', ':'],
        type: 'operator'
    },
];

const strictRules = [
    {
        patterns: ['if', 'else', 'for', 'while', 'foreach', 'class', 'function', 'constructor', 'return', 'export', 'default', 'import', '#include', 'from', 'in', 'of', 'extends'],
        type: 'statement'
    },
    {
        patterns: ['bool', 'void', 'int', 'char', 'double', 'float', 'var', 'const', 'let', 'auto', 'true', 'false'],
        type: 'type'
    }
];

export default class TextFormatter {

    applyFormattingRules(text) {
        if (!text)
            return [];

        var matches = this._applyPatternRules(text);

        matches.reduce((column, match) => {
            match.width = this._getFragmentWidth(match.text, 0, match.text.length, column);
            return column + match.width;
        }, 0);

        return matches;
    }

    _applyPatternRules(text) {
        for (const rule of patternRules) {
            const match = rule.pattern.exec(text);

            if (!match)
                continue;

            const matchText = match[0];
            const startIndex = match.index;
            const endIndex = startIndex + matchText.length;

            return [
                ...this._applyPatternRules(text.substring(0, startIndex)),
                { text: matchText, type: rule.type },
                ...this._applyPatternRules(text.substring(endIndex, text.length))
            ];
        }

        return this._applyLooseRules(text);
    }

    _applyLooseRules(text) {
        for (const rule of looseRules) {
            for (const pattern of rule.patterns) {
                if (!text.includes(pattern))
                    continue;

                const [head, ...tail] = text
                    .split(pattern)
                    .map(textBetween => this._applyLooseRules(textBetween));

                return tail.reduce((a, e) => [...a, { text: pattern, type: rule.type }, ...e], head);
            }
        }

        return this._applyStrictRules(text);
    }

    _applyStrictRules(text) {
        for (const rule of strictRules) {
            for (const pattern of rule.patterns) {
                if (text !== pattern)
                    continue;

                return [{ text: pattern, type: rule.type }];
            }
        }

        return this._applyDefaultRule(text);
    }

    _applyDefaultRule(text) {
        if (!text)
            return [];

        return [{
            text: text.replace(/\s/, ' '),
            type: 'plain'
        }];
    }

    _getFragmentWidth(text, begin, end, startColumn) {
        let column = startColumn;

        for (let index = begin; index < end; index++)
            column += this._getCharacterWidth(text[index], column);

        return column - startColumn;
    }

    _getCharacterWidth(character, column) {
        switch (character) {
            case '\t': return Math.ceil((column + 1) / 4) * 4 - column;
            default: return 1;
        }
    }
}