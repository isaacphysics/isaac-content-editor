import React from "react";
import { IsaacMultiChoiceQuestion } from "../../../../isaac-data-types";
import { CheckboxDocProp } from "../../props/CheckboxDocProp";
import { PresenterProps } from "../../registry";
import { QuestionMetaPresenter } from "./QuestionMetaPresenter";

export function MultipleChoiceQuestionPresenter({showMeta = true, ...props}: {showMeta?: boolean} & PresenterProps) {
    const {doc, update} = props;
    const question = doc as IsaacMultiChoiceQuestion;
    return <>
        {showMeta && <QuestionMetaPresenter {...props} />}
        <CheckboxDocProp doc={question} update={update} prop="randomiseChoices" label="Randomise Choices" checkedIfUndefined={true} />
    </>;
}
