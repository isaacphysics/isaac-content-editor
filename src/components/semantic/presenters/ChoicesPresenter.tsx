import React from "react";

import { IsaacQuestionBase } from "../../../isaac-data-types";

import { CHOICE_TYPES } from "../ChoiceInserter";
import { PresenterProps } from "../registry";
import { ListPresenterProp } from "../props/listProps";
import { FreeTextQuestionInstructions, QUESTION_TYPES } from "./questionPresenters";
import { Box } from "../SemanticItem";

const choicesType: Record<QUESTION_TYPES, CHOICE_TYPES | null> = {
    isaacQuestion: null,
    isaacMultiChoiceQuestion: "choice",
    isaacNumericQuestion: "quantity",
    isaacSymbolicQuestion: "formula",
    isaacSymbolicChemistryQuestion: "chemicalFormula",
    isaacStringMatchQuestion: "stringChoice",
    isaacFreeTextQuestion: "freeTextRule",
    isaacLLMFreeTextQuestion: null,
    isaacSymbolicLogicQuestion: "logicFormula",
    isaacGraphSketcherQuestion: "graphChoice",
    isaacRegexMatchQuestion: "regexPattern",
    isaacItemQuestion: "itemChoice",
    isaacReorderQuestion: "itemChoice",
    isaacParsonsQuestion: "parsonsChoice",
    isaacClozeQuestion: "itemChoice",
    isaacDndQuestion: "itemChoice",
    isaacCoordinateQuestion: "coordinateChoice",
};

function Instructions({doc}: { doc: IsaacQuestionBase }) {
    switch (doc.type) {
        case "isaacFreeTextQuestion":
            return <FreeTextQuestionInstructions />;
    }
    return null;
}

export function ChoicesPresenter(props: PresenterProps<IsaacQuestionBase>) {
    const {doc} = props;
    const choiceType = choicesType[doc.type as QUESTION_TYPES];
    if (choiceType === null) {
        return null;
    }
    return <Box name="Choices">
        <ListPresenterProp {...props}
                           prop="choices"
                           childTypeOverride={choiceType}
        />
        <Instructions doc={doc} />
    </Box>;
}

