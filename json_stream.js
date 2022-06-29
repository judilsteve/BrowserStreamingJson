const util = require('util');

const testJson = "[\n" +
"    {\n" +
"        \"a\": \"b  \",\n" +
"        \"a\\\"\": \"b\",\n" +
"        \"a{}}}\": 123\n" +
"    },\n" +
"    {},\n" +
"    {\n" +
"        \"asd\": \"x{}{{{}\\\"}}\\\"\"\n" +
"    },\n" +
"    [{},[], {\"x \\n asd\": [{}, []]}],\n" +
"    {\n" +
"        \"b\": [{}]\n" +
"    },\n" +
"    123,\n" +
"    \"abc\",\n" +
"    true,\n" +
"    {\"x\": 42}\n" +
"]";

console.debug(testJson);
console.debug(JSON.parse(testJson));

class BeforeArrayState {
    processNext(char) {
        if (char === '[') return { newState: new BetweenElementsState(), includeInBuffer: false, yieldBuffer: false };
        else if (!' \n'.includes(char)) throw new Error(`Unexpected character ${char} before start of top-level array`);
        else return { newState: this, includeInBuffer: false, yieldBuffer: false };
    }
}

class BetweenElementsState {
    processNext(char) {
        if (', \n'.includes(char)) return { newState: this, includeInBuffer: false, yieldBuffer: false };
        else if (char === ']') return { newState: undefined, includeInBuffer: false, yieldBuffer: false };
        else return { newState: new InsideElementState(char), includeInBuffer: true, yieldBuffer: false };
    }
}

class InsideElementState {
    constructor(firstChar) {
        this.nestingDepth = '{['.includes(firstChar) ? 1 : 0;
        this.insideString = firstChar === '"';
        this.isEscapeSequence = false;
    }

    processNext(char) {
        if (this.insideString) {
            if (char === '\\') {
                this.isEscapeSequence = true;
            } else if (this.isEscapeSequence) {
                this.isEscapeSequence = false;
            } else if (char === '"') {
                this.insideString = false;
            }
        } else if (char === '"') {
            this.insideString = true;
        } else if ('{['.includes(char)) {
            this.nestingDepth++;
        } else if ('}]'.includes(char)) {
            this.nestingDepth--;
            if(this.nestingDepth < 0) return { newState: undefined, includeInBuffer: false, yieldBuffer: true };
        } else if (this.nestingDepth === 0 && char === ',') {
            return { newState: new BetweenElementsState(), includeInBuffer: false, yieldBuffer: true };
        }
        return { newState: this, includeInBuffer: this.insideString || !' \n'.includes(char), yieldBuffer: false };
    }
}

function* slurpJson(json) {
    let state = new BeforeArrayState();
    buffer = '';
    for (const char of json) {
        if(!state) break
        const { newState, includeInBuffer, yieldBuffer } = state.processNext(char);
        if (includeInBuffer) buffer += char;
        if (yieldBuffer) {
            yield JSON.parse(buffer);
            buffer = '';
        }
        state = newState;
    }
}

for (const item of slurpJson(testJson)) {
    console.log(util.inspect(item));
}
