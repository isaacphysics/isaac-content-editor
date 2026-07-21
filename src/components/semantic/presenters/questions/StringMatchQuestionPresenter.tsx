import React from "react";
import { QuestionMetaPresenter } from "./questionPresenters";
import { PresenterProps } from "../../registry";
import { IsaacStringMatchQuestion } from "../../../../isaac-data-types";
import { CheckboxDocProp } from "../../props/CheckboxDocProp";

export function StringMatchQuestionPresenter(props: PresenterProps<IsaacStringMatchQuestion>) {
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp {...props} prop="multiLineEntry" label="Multi-line" />
    </>;
}
