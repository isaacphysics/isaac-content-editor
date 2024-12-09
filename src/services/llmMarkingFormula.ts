import { Parser, Grammar } from 'nearley';
import grammar from '../grammars/llmMarkingFormula.nearley';

export function parseMarkingFormula(markingFormula?: string) {
    if (!markingFormula) {
        return "";
    }
    
    const parser = new Parser(Grammar.fromCompiled(grammar));
    parser.feed(markingFormula);
    if (parser.results.length > 1) {
        throw new Error('Ambiguous grammar');
    }
    if (parser.results.length === 0) {
        throw new Error('Invalid grammar');
    }
    return parser.results[0];
}
