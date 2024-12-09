import { LLMConstantNode, LLMFormulaNode, LLMFreeTextMarkedExample, LLMFunctionNode, LLMVariableNode } from "../isaac-data-types";

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

export function evaluateMarkingFormula(markingFormula: LLMFormulaNode, value: Record<string, number>): number { 
    if (isLLMConstantNode(markingFormula)) { 
        return markingFormula.value; 
    } else if (isLLMVariableNode(markingFormula)) {
        if (typeof value === 'object') {
            return value[markingFormula.name] ?? 0;
        }
        return 0;
    } else if (isLLMFunctionNode(markingFormula)) {
        const args: LLMFormulaNode[] = markingFormula.arguments;
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

export function evaluateMarkTotal(markingFormula?: LLMFormulaNode, value?: Record<string, number>, maxMarks?: number): number {
    function defaultMarkingFormula(): number {
        if (typeof value === 'object' && value !== null) {
            let total: number = 0;
            for (const key in value) {
                total = total + (key !== "maxMarks" && value[key] ? value[key] : 0);
            }

            return Math.min(maxMarks ?? 0, total);
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
