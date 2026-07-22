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
import {isAda} from "../../../../services/site";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../../../services/constants";

export const QuestionContext = React.createContext<Content | null>(null);

export const EditableSignificantFiguresMin = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMin", {label: "from", block: true});
export const EditableSignificantFiguresMax = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMax", {label: "to", block: true});

export function changeQuestionType({doc, update, newType}: PresenterProps & {newType: QUESTION_TYPES}) {
    const newDoc = {...doc, type: newType} as AnyQuestion;
    if (newType === "isaacQuestion") {
        newDoc.showConfidence = false;
        // Remove the defaultFeedback property as it is not applicable to quick questions
        delete newDoc.defaultFeedback;
    } else {
        delete newDoc.showConfidence;
    }
    
    if (newType === "isaacNumericQuestion") {
        // Add the default value if it is missing
        newDoc.requireUnits = true;
        if (isAda) {
            newDoc.disregardSignificantFigures = true;
        } else {
            newDoc.disregardSignificantFigures = false;
        }
    } else {
        delete newDoc.requireUnits;
        delete newDoc.availableUnits;
        delete newDoc.displayUnit;
    }

    if (newType === "isaacMultiChoiceQuestion") {
        newDoc.randomiseChoices = true;
    } else {
        delete newDoc.randomiseChoices;
    }

    if (newType === "isaacCoordinateQuestion") {
        newDoc.disregardSignificantFigures = false;
    } else {
        delete newDoc.ordered;
        delete newDoc.numberOfCoordinates;
        delete newDoc.numberOfDimensions;
        delete newDoc.placeholderValues;
        delete newDoc.useBrackets;
        delete newDoc.separator;
        delete newDoc.prefixes;
        delete newDoc.suffixes;
        delete newDoc.buttonText;
    }

    if (["isaacNumericQuestion", "isaacCoordinateQuestion"].includes(newType)) {
        delete newDoc.disregardSignificantFigures;
        delete newDoc.significantFiguresMin;
        delete newDoc.significantFiguresMax;
    }
    
    if (newType === "isaacLLMFreeTextQuestion") {
        // Remove the choices, answer, and defaultFeedback properties as they are not applicable to LLM-Marked questions
        delete newDoc.answer;
        delete newDoc.choices;
        delete newDoc.defaultFeedback;
    } else {
        delete newDoc.markScheme;
        delete newDoc.maxMarks;
        delete newDoc.additionalMarkingInstructions;
        delete newDoc.markingFormula;
        delete newDoc.markingFormulaString;
        delete newDoc.markedExamples;
    }

    if (!["isaacItemQuestion", "isaacClozeQuestion", "isaacDragAndDropQuestion",
        "isaacReorderQuestion", "isaacParsonsQuestion"].includes(newType)) {
        delete newDoc.items;
        delete newDoc.randomiseItems;
    }
    if (!["isaacClozeQuestion", "isaacDragAndDropQuestion"].includes(newType)) {
        delete newDoc.withReplacement;
        delete newDoc.detailedItemFeedback;
    }
    if (newType !== "isaacParsonsQuestion") {
        delete newDoc.disableIndentation;
    }

    if (!["isaacSymbolicQuestion", "isaacSymbolicLogicQuestion", "isaacSymbolicChemistryQuestion"].includes(newType)) {
        delete newDoc.formulaSeed;
        delete newDoc.availableSymbols;
    }
    if (newType !== "isaacSymbolicChemistryQuestion") {
        delete newDoc.isNuclear;
        delete newDoc.allowPermutations;
        delete newDoc.allowScalingCoefficients;
        delete newDoc.showInequalitySeed;
    }

    if (!["isaacStringMatchQuestion", "isaacRegexMatchQuestion"].includes(newType)) {
        delete newDoc.multiLineEntry;
    }
    if (newType !== "isaacStringMatchQuestion") {
        delete newDoc.preserveLeadingWhitespace;
        delete newDoc.preserveTrailingWhitespace;
    }

    if (newType !== "isaacLLMFreeTextQuestion") {
        delete newDoc.markScheme;
        delete newDoc.maxMarks;
        delete newDoc.additionalMarkingInstructions;
        delete newDoc.markingFormula;
        delete newDoc.markingFormulaString;
        delete newDoc.markedExamples;
    }

    if (newType !== "isaacGraphSketcherQuestion") {
        delete newDoc.maxNumCurves;
        delete newDoc.axisLabelX;
        delete newDoc.axisLabelY;
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
