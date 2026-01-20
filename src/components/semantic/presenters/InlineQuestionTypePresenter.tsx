import { PresenterProps } from "../registry";
import { Content } from "../../../isaac-data-types";
import { QUESTION_TYPES, QuestionTypeSelector } from "./questionPresenters";

export type INLINE_TYPES = Extract<QUESTION_TYPES,
    "isaacStringMatchQuestion"
    | "isaacNumericQuestion"
    | "isaacMultiChoiceQuestion"
    | "isaacRegexMatchQuestion"
>;

export const EditableInlineTypeProp = (props : PresenterProps<Content> & {disabled? : boolean}) => {
    const {doc, update, disabled} = props;

    const inlineQuestionTypes: Record<INLINE_TYPES, { name: string }> = {
        isaacStringMatchQuestion: { name: "String Match Question" },
        isaacNumericQuestion: { name: "Numeric Question" },
        isaacMultiChoiceQuestion: { name: "Multiple Choice Question" },
        isaacRegexMatchQuestion: { name: "Regex Match Question" },
    };

    if (doc.type === "inlineQuestionPart") {
        const newDoc = {...doc, type: "isaacStringMatchQuestion"};
        update(newDoc);
        return QuestionTypeSelector({doc: newDoc, update, questionTypes: inlineQuestionTypes, disabled});
    }

    return QuestionTypeSelector({doc, update, questionTypes: inlineQuestionTypes, disabled});
};
