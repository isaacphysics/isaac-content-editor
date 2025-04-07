import { LLMConstantNode, LLMFormulaNode, LLMFunctionNode, LLMVariableNode } from "../isaac-data-types";

// Type guards for LLMFormulaNode
export function isLLMFunctionNode(node: LLMFormulaNode): node is LLMFunctionNode {
    return node.type === "LLMMarkingFunction";
}
export function isLLMVariableNode(node: LLMFormulaNode): node is LLMVariableNode {
    return node.type === "LLMMarkingVariable";
}
export function isLLMConstantNode(node: LLMFormulaNode): node is LLMConstantNode {
    return node.type === "LLMMarkingConstant";
}

export function evaluateMarkingFormula<T extends LLMFormulaNode>(markingFormula: T, value: Record<string, number>): number { 
    if (isLLMConstantNode(markingFormula)) { 
        return markingFormula.value; 
    } else if (isLLMVariableNode(markingFormula)) {
        if (typeof value === 'object') {
            if (value.hasOwnProperty(markingFormula.name)) {
                return value[markingFormula.name] ?? 0;
            } else {
                throw new Error("Marking variable not found: " + markingFormula.name);
            }
        }
        return 0;
    } else if (isLLMFunctionNode(markingFormula)) {
        const args: LLMFormulaNode[] = Array.isArray(markingFormula.arguments) ? markingFormula.arguments : [markingFormula.arguments];
        switch (markingFormula.name) {
            case "SUM":
                return args.map((arg: LLMFormulaNode) => evaluateMarkingFormula(arg, value)).reduce((acc: number, val: number) => acc + val, 0);
            case "MAX":
                return Math.max(...args.map((arg: LLMFormulaNode) => evaluateMarkingFormula(arg, value)));
            case "MIN":
                return Math.min(...args.map((arg: LLMFormulaNode) => evaluateMarkingFormula(arg, value)));
            default:
                throw new Error("Unknown marking function: " + markingFormula.name);
        }
    }
    throw new Error("Unknown marking expression type: " + markingFormula.type);
}

export function evaluateMarkTotal<T extends LLMFormulaNode>(markingFormula?: T, value?: Record<string, number>) : number {
    function defaultMarkingFormula(): number {
        if (typeof value === 'object' && value !== null) {
            let total: number = 0;
            for (const key in value) {
                total = total + (key !== "maxMarks" && value[key] ? value[key] : 0);
            }

            return Math.min(value.maxMarks ?? 0, total);
        }
        return 0;
    }
    
    if (markingFormula === undefined) {
        return defaultMarkingFormula();
    } 

    try {
        return evaluateMarkingFormula(markingFormula, value ?? {});
    } catch {
        return defaultMarkingFormula();
    }
} 
