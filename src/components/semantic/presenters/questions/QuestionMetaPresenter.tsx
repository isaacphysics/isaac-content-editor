import React, {useState} from "react";
import {EditableIDProp, EditableTitleProp} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {
    AnyQuestion,
    Content,
    IsaacNumericQuestion,
    IsaacQuestionBase,
    IsaacQuickQuestion
} from "../../../../isaac-data-types";
import {SemanticDocProp} from "../../props/SemanticDocProp";
import {PresenterProps} from "../../registry";
import {SemanticListProp} from "../../props/listProps";
import {NumberDocPropFor} from "../../props/NumberDocPropFor";
import {ChoicesPresenter} from "../ChoicesPresenter";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPE_DEFAULTS, QUESTION_TYPE_FIELDS, QUESTION_TYPES} from "../../../../services/constants";

export const QuestionContext = React.createContext<Content | null>(null);

export const EditableSignificantFiguresMin = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMin", {label: "from", block: true});
export const EditableSignificantFiguresMax = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMax", {label: "to", block: true});

export function changeQuestionType({doc, update, newType}: PresenterProps & {newType: QUESTION_TYPES}) {
    if (doc.type === newType) return;
    const allQuestionFields = [...new Set( Object.values(QUESTION_TYPE_FIELDS).flatMap(Object.keys))] as (keyof AnyQuestion)[];
    const newDoc = { ...doc, type: newType } as AnyQuestion;

    // Remove all question type-specific fields, then add any default values
    for (const field of allQuestionFields) {
        delete newDoc[field];
    }
    Object.assign(newDoc, QUESTION_TYPE_DEFAULTS[newType]);

    // Removing base fields from special-case question types
    if (newType === "isaacQuestion") {
        delete newDoc.defaultFeedback;
    }

    if (newType === "isaacLLMFreeTextQuestion") {
        delete newDoc.answer;
        delete newDoc.choices;
        delete newDoc.defaultFeedback;
    }

    update(newDoc);
}

export function QuestionTypeSelector({doc, update, questionTypes = HUMAN_QUESTION_TYPES, disabled = false}
: PresenterProps & {questionTypes?: Partial<Record<QUESTION_TYPES, string>>, disabled?: boolean}) {
    const [isOpen, setOpen] = useState(false);

    const questionType = questionTypes[doc.type as QUESTION_TYPES];

    return <Dropdown toggle={() => setOpen(toggle => !toggle)} isOpen={isOpen} disabled={disabled}>
        <DropdownToggle caret>
            {questionType}
        </DropdownToggle>
        <DropdownMenu>
            {Object.keys(questionTypes).map((key) => {
                const possibleType = questionTypes[key as QUESTION_TYPES];
                return <DropdownItem key={key} active={questionType === possibleType} onClick={() => {
                    if (questionType !== possibleType) {
                        changeQuestionType({doc, update, newType: key as QUESTION_TYPES});
                    }
                }}>
                    {possibleType}
                </DropdownItem>;
            })}
        </DropdownMenu>
    </Dropdown>;
}

export function AnswerPresenter(props: PresenterProps<IsaacQuickQuestion>) {
    return <SemanticDocProp {...props} prop={"answer"} name="Answer" />;
}

export function QuestionFooterPresenter(props: PresenterProps<IsaacQuestionBase>) {
    return <>
        <ChoicesPresenter {...props} />
        <SemanticDocProp {...props} prop="defaultFeedback" name="Default Feedback" onDelete={() => 
            props.update({...props.doc, defaultFeedback: undefined})
        } />
        <AnswerPresenter {...props} />
        <SemanticListProp {...props} prop="hints" type="hints" />
    </>;
}

export function HintsPresenter(props: PresenterProps<IsaacQuestionBase>) {
    return <SemanticListProp {...props} prop="hints" type="hints" />;
}

export function QuestionMetaPresenter(props: PresenterProps) {
    return <div>
        <div className={styles.questionType}>
            <QuestionTypeSelector {...props} />
        </div>
        <h4><EditableTitleProp {...props} placeHolder="Question title"/></h4>
        <h6><EditableIDProp {...props} label="Question ID"/></h6>
    </div>;
}
