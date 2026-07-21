import { PresenterProps } from "../../registry";
import { Content } from "../../../../isaac-data-types";
import { QuestionTypeSelector } from "./questionPresenters";
import { QUESTION_TYPES } from "../../../../services/constants";

export type INLINE_TYPES = Extract<QUESTION_TYPES,
    "isaacStringMatchQuestion"
    | "isaacNumericQuestion"
    | "isaacMultiChoiceQuestion"
    | "isaacRegexMatchQuestion"
>;

export const EditableInlineTypeProp = (props: PresenterProps<Content> & {disabled? : boolean}) => {
    const {doc, update, disabled} = props;

    const inlineQuestionTypes: Record<INLINE_TYPES, string> = {
        isaacStringMatchQuestion: "String Match Question",
        isaacNumericQuestion: "Numeric Question",
        isaacMultiChoiceQuestion: "Multiple Choice Question",
        isaacRegexMatchQuestion: "Regex Match Question",
    };

    if (doc.type === "inlineQuestionPart") {
        const newDoc = {...doc, type: "isaacStringMatchQuestion"};
        update(newDoc);
        return QuestionTypeSelector({doc: newDoc, update, questionTypes: inlineQuestionTypes, disabled});
    }

    return QuestionTypeSelector({doc, update, questionTypes: inlineQuestionTypes, disabled});
};
