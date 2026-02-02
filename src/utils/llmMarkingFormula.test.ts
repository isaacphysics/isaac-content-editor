import { LLMConstantNode, LLMFormulaNode, LLMFreeTextMarkedExample, LLMFunctionNode, LLMVariableNode } from "../isaac-data-types";
import { evaluateMarkingFormula, evaluateMarkTotal } from "./llmMarkingFormula";

// Type guarded shorthands for generating LLMFormulaNodes
const markingFormulaConstant: (value: number) => LLMConstantNode = (value) => { return {type: "LLMMarkingConstant", value}; };
const markingFormulaVariable: (name: string) => LLMVariableNode = (name) => { return {type: "LLMMarkingVariable", name}; };
const markingFormulaFunction: (name: string, args: LLMFormulaNode[]) => LLMFunctionNode = (name, args) => { return {type: "LLMMarkingFunction", name, arguments: args}; };

// default = MIN(maxMarks, SUM(x, y, z))
const defaultMarkingFormula: LLMFunctionNode = {type: "LLMMarkingFunction", name: "MIN", arguments: [
    {type: "LLMMarkingVariable", name: "maxMarks"} as LLMVariableNode, 
    {type: "LLMMarkingFunction", name: "SUM", arguments: [
        {type: "LLMMarkingVariable", name: "x"} as LLMVariableNode,
        {type: "LLMMarkingVariable", name: "y"} as LLMVariableNode,
        {type: "LLMMarkingVariable", name: "z"} as LLMVariableNode
    ]} as LLMFunctionNode
]};
// advantageDisadvantage = SUM(MAX(advantageOne, advantageTwo), MAX(disadvantageOne, disadvantageTwo))
const advantageDisadvantageMarkingFormula: LLMFunctionNode = {type: "LLMMarkingFunction", name: "SUM", arguments: [
    {type: "LLMMarkingFunction", name: "MAX", arguments: [
        {type: "LLMMarkingVariable", name: "advantageOne"} as LLMVariableNode,
        {type: "LLMMarkingVariable", name: "advantageTwo"} as LLMVariableNode,
    ]} as LLMFunctionNode,
    {type: "LLMMarkingFunction", name: "MAX", arguments: [
        {type: "LLMMarkingVariable", name: "disadvantageOne"} as LLMVariableNode,
        {type: "LLMMarkingVariable", name: "disadvantageTwo"} as LLMVariableNode,
    ]} as LLMFunctionNode
]};
// pointExplanation = SUM(MAX(pointOne, pointTwo), MAX(MIN(pointOne, explanationOne), MIN(pointTwo, explanationTwo)))
const pointExplanationMarkingFormula: LLMFunctionNode = {type: "LLMMarkingFunction", name: "SUM", arguments: [
    {type: "LLMMarkingFunction", name: "MAX", arguments: [
        {type: "LLMMarkingVariable", name: "pointOne"} as LLMVariableNode,
        {type: "LLMMarkingVariable", name: "pointTwo"} as LLMVariableNode,
    ]} as LLMFunctionNode,
    {type: "LLMMarkingFunction", name: "MAX", arguments: [
        {type: "LLMMarkingFunction", name: "MIN", arguments: [
            {type: "LLMMarkingVariable", name: "pointOne"} as LLMVariableNode,
            {type: "LLMMarkingVariable", name: "explanationOne"} as LLMVariableNode,
        ]} as LLMFunctionNode,
        {type: "LLMMarkingFunction", name: "MIN", arguments: [
            {type: "LLMMarkingVariable", name: "pointTwo"} as LLMVariableNode,
            {type: "LLMMarkingVariable", name: "explanationTwo"} as LLMVariableNode,
        ]} as LLMFunctionNode,
    ]} as LLMFunctionNode
]};

const answer: LLMFreeTextMarkedExample = { answer: "example answer", marks: {"x": 1, "y": 2, "z": 0, "maxMarks": 2}, marksAwarded: 2 };
const marks = answer.marks ?? {};

describe("evaluateMarkingFormula", () => {
    it("should return the value of a constant marking formula", () => {
        expect(evaluateMarkingFormula(markingFormulaConstant(3), marks)).toBe(3);
        expect(evaluateMarkingFormula(markingFormulaConstant(1), marks)).toBe(1);
    });
    it("should return the value of a variable marking formula", () => {
        expect(evaluateMarkingFormula(markingFormulaVariable("x"), marks)).toBe(1);
        expect(evaluateMarkingFormula(markingFormulaVariable("y"), marks)).toBe(2);
        expect(evaluateMarkingFormula(markingFormulaVariable("z"), marks)).toBe(0);
    });
    it("should return the value of a function SUM marking formula", () => {
        const formulaSum: LLMFunctionNode = markingFormulaFunction("SUM", [markingFormulaConstant(3), markingFormulaConstant(2)]);
        const formulaSum2: LLMFunctionNode = markingFormulaFunction("SUM", [markingFormulaConstant(3), markingFormulaConstant(5)]);

        expect(evaluateMarkingFormula(formulaSum, marks)).toBe(5);
        expect(evaluateMarkingFormula(formulaSum2, marks)).toBe(8);
    });
    it("should return the value of a function MAX marking formula", () => {
        const formulaMax: LLMFunctionNode = markingFormulaFunction("MAX", [markingFormulaConstant(3), markingFormulaConstant(2)]);
        const formulaMax2: LLMFunctionNode = markingFormulaFunction("MAX", [markingFormulaConstant(3), markingFormulaConstant(5)]);

        expect(evaluateMarkingFormula(formulaMax, marks)).toBe(3);
        expect(evaluateMarkingFormula(formulaMax2, marks)).toBe(5);
    });
    it("should return the value of a function MIN marking formula", () => {
        const formulaMin: LLMFunctionNode = markingFormulaFunction("MIN", [markingFormulaConstant(3), markingFormulaConstant(2)]);
        const formulaMin2: LLMFunctionNode = markingFormulaFunction("MIN", [markingFormulaConstant(3), markingFormulaConstant(5)]);

        expect(evaluateMarkingFormula(formulaMin, marks)).toBe(2);
        expect(evaluateMarkingFormula(formulaMin2, marks)).toBe(3);
    });
    it("should return an error when given a marking formula with an invalid type", () => {
        function invalidTypedMarkingFormula() {
            evaluateMarkingFormula({type: "LLMInvalidNode", name: "INVALID"} as unknown as LLMFormulaNode, marks);
        }

        expect(invalidTypedMarkingFormula).toThrow("Unknown marking expression type: LLMInvalidNode");
    });
    it("should return an error when given a marking formula with an invalid function", () => {
        function invalidNamedMarkingFormula() {
            evaluateMarkingFormula(markingFormulaFunction("INVALID", []), marks);
        }

        expect(invalidNamedMarkingFormula).toThrow("Unknown marking function: INVALID");
    });
});

describe("evaluateMarkTotal", () => {
    it("should return MIN(maxMarks, SUM(..all marks..) when given no marking formula", () => {
        expect(evaluateMarkTotal(defaultMarkingFormula, answer.marks)).toBe(2);

        expect(evaluateMarkTotal(undefined, answer.marks)).toBe(2);
    });
    it("should return one advantage mark and one disadvantage mark when given an advantage-disadvantage marking formula", () => {
        const advantageDisadvantageMarks: Record<string, number> = {"advantageOne": 1, "advantageTwo": 1, "disadvantageOne": 1, "disadvantageTwo": 0, "maxMarks": 2};
        const twoAdvantages: Record<string, number> = {"advantageOne": 1, "advantageTwo": 1, "disadvantageOne": 0, "disadvantageTwo": 0, "maxMarks": 2};
        const twoDisadvantages: Record<string, number> = {"advantageOne": 0, "advantageTwo": 0, "disadvantageOne": 1, "disadvantageTwo": 1, "maxMarks": 2};

        expect(evaluateMarkTotal(advantageDisadvantageMarkingFormula, advantageDisadvantageMarks)).toBe(2);
        expect(evaluateMarkTotal(advantageDisadvantageMarkingFormula, twoAdvantages)).toBe(1);
        expect(evaluateMarkTotal(advantageDisadvantageMarkingFormula, twoDisadvantages)).toBe(1);
    });
    it("should return one point mark and one matching explanation mark when given a point-explanation marking formula", () => {
        const pointExplanationMarks: Record<string, number> = {"pointOne": 1, "pointTwo": 0, "explanationOne": 1, "explanationTwo": 0, "maxMarks": 2};
        const twoPoints: Record<string, number> = {"pointOne": 1, "pointTwo": 1, "explanationOne": 0, "explanationTwo": 0, "maxMarks": 2};
        const twoExplanations: Record<string, number> = {"pointOne": 0, "pointTwo": 0, "explanationOne": 0, "explanationTwo": 1, "maxMarks": 2};
        const mismatchedPointExplanation: Record<string, number> = {"pointOne": 1, "pointTwo": 0, "explanationOne": 0, "explanationTwo": 1, "maxMarks": 2};

        expect(evaluateMarkTotal(pointExplanationMarkingFormula, pointExplanationMarks)).toBe(2);
        expect(evaluateMarkTotal(pointExplanationMarkingFormula, twoPoints)).toBe(1);
        expect(evaluateMarkTotal(pointExplanationMarkingFormula, twoExplanations)).toBe(0);
        expect(evaluateMarkTotal(pointExplanationMarkingFormula, mismatchedPointExplanation)).toBe(1);
    });
    it("should return MIN(maxMarks, SUM(..all marks..) when given a marking formula with an invalid type", () => {
        expect(evaluateMarkTotal(defaultMarkingFormula, answer.marks)).toBe(2);

        expect(evaluateMarkTotal({type: "LLMInvalidNode", name: "INVALID"} as unknown as LLMFormulaNode, answer.marks)).toBe(2);
    });
    it("should return MIN(maxMarks, SUM(..all marks..) when given a marking formula with an invalid function", () => {
        expect(evaluateMarkTotal(defaultMarkingFormula, answer.marks)).toBe(2);

        expect(evaluateMarkTotal(markingFormulaFunction("INVALID", []), answer.marks)).toBe(2);
    });
});
