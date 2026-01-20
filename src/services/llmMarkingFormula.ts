import { Parser, Grammar } from 'nearley';
import grammar from '../grammars/llmMarkingFormula.nearley';


export function parseMarkingFormula(markingFormula?: string) {
    if (!markingFormula) {
        return;
    }
    
    const parser = new Parser(Grammar.fromCompiled(grammar));
    try {
        parser.feed(markingFormula);
    } catch (_) {
        throw new Error('Invalid marking formula');
    }
    if (parser.results.length > 1) {
        throw new Error('Ambiguous marking formula');
    }
    if (parser.results.length === 0) {
        throw new Error('Invalid marking formula');
    }
    return parser.results[0];
}
