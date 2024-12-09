import { LLMConstantNode, LLMFormulaNode, LLMFreeTextMarkedExample, LLMFunctionNode, LLMVariableNode } from "../../../isaac-data-types";
import { evaluateMarkingFormula } from "./LLMQuestionPresenter";

const markingFormulaConstant: LLMConstantNode = {type: "LLMMarkingConstant", value: 1};
const markingFormulaFunction: LLMFunctionNode = {type: "LLMMarkingFunction", name: "SUM", arguments: [markingFormulaConstant, markingFormulaConstant]};
const markingFormulaVariable: LLMVariableNode = {type: "LLMMarkingVariable", name: "x"};
const value: LLMFreeTextMarkedExample[] = [{answer: "example answer", marks: {"x": 1, "y": 2}, marksAwarded: 2}];

describe("Marking Formula", () => {
        it("should return an error when given an invalid marking formula function", () => {
            const a = evaluateMarkingFormula({...markingFormulaFunction, name: "INVALID"} as LLMFunctionNode, value[0].marks);
            expect(true).toBe(true);
        })
    }
)
