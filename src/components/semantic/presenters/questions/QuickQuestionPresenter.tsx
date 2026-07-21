import React from "react";
import { QuestionMetaPresenter } from "./questionPresenters";
import { PresenterProps } from "../../registry";
import { IsaacQuickQuestion } from "../../../../isaac-data-types";
import { CheckboxDocProp } from "../../props/CheckboxDocProp";

export function QuickQuestionPresenter(props: PresenterProps) {
    const question = props.doc as IsaacQuickQuestion;
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp doc={question} update={props.update} prop="showConfidence" label="Show confidence question" />
    </>;
}
