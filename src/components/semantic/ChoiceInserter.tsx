import React, { FunctionComponent } from "react";

import { Choice, Content } from "../../isaac-data-types";

import { InsertButton, InserterProps } from "./presenters/ListChildrenPresenter";
import { ContentType } from "./registry";

function ChoiceInserter<T extends Choice>(empty: T) {
    // noinspection UnnecessaryLocalVariableJS
    const ChoiceInserter = ({insert, position}: InserterProps) =>
        <InsertButton onClick={() => insert(position, {...empty, correct: position === 0} as Content)}/>;
    return ChoiceInserter;
}

const emptyChoice = {
    encoding: "markdown",
    value: "",
    explanation: {
        type: "content",
        children: [],
    },
};

export type CHOICE_TYPES =
    | "choice"
    | "quantity"
    | "formula"
    | "chemicalFormula"
    | "stringChoice"
    | "freeTextRule"
    | "logicFormula"
    | "graphChoice"
    | "regexPattern"
    | "itemChoice"
    | "parsonsChoice"
    | "dndChoice"
    | "coordinateChoice"
    ;

const emptyChoices = [
    {...emptyChoice, type: "choice"},
    {...emptyChoice, type: "quantity", units: ""},
    {...emptyChoice, type: "formula", pythonExpression: "", requiresExactMatch: false},
    {...emptyChoice, type: "chemicalFormula", mhchemExpression: ""},
    {...emptyChoice, type: "stringChoice", caseInsensitive: false},
    {...emptyChoice, type: "freeTextRule", caseInsensitive: true, allowsExtraWords: true},
    {...emptyChoice, type: "logicFormula", pythonExpression: "", requiresExactMatch: false},
    {...emptyChoice, type: "graphChoice", graphSpec: ""},
    {...emptyChoice, type: "regexPattern", matchWholeString: false, caseInsensitive: false, multiLineRegex: true},
    {...emptyChoice, type: "itemChoice", children: []},
    {...emptyChoice, type: "parsonsChoice", children: []},
    {...emptyChoice, type: "dndChoice", children: []},
    {...emptyChoice, type: "coordinateChoice", items: []},
];

export const CHOICE_INSERTER_MAP: Partial<Record<ContentType, FunctionComponent<InserterProps>>> = Object.fromEntries(emptyChoices.map((choice) => {
    return [choice.type as ContentType, ChoiceInserter(choice)];
}));
