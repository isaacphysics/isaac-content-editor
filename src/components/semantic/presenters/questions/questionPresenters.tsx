import React, {useState} from "react";
import {EditableIDProp, EditableTitleProp} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
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

export function changeQuestionType({doc, update, newType}: PresenterProps & {newType: QUESTION_TYPES}) {
    const newDoc = {...doc, type: newType} as AnyQuestion;
    if (newType === "isaacNumericQuestion" && !newDoc.hasOwnProperty("requireUnits")) {
        // Add the default value if it is missing
        newDoc.requireUnits = true;
        delete newDoc.displayUnit;
        if (isAda) {
            newDoc.disregardSignificantFigures = true;
        } else {
            newDoc.disregardSignificantFigures = false;
        }
        delete newDoc.showConfidence;
        delete newDoc.randomiseChoices;
    } else if (newType === "isaacQuestion" && !newDoc.hasOwnProperty("showConfidence")) {
        newDoc.showConfidence = false;
        delete newDoc.requireUnits;
        delete newDoc.disregardSignificantFigures;
        delete newDoc.displayUnit;
        delete newDoc.randomiseChoices;
    } else if (newType === "isaacMultiChoiceQuestion" && !newDoc.hasOwnProperty("randomiseChoices")) {
        // Add the default value if it is missing
        newDoc.randomiseChoices = true;
        delete newDoc.requireUnits;
        delete newDoc.disregardSignificantFigures;
        delete newDoc.displayUnit;
        delete newDoc.showConfidence;
    } else if (newType === "isaacCoordinateQuestion") {
        newDoc.disregardSignificantFigures = false;
        delete newDoc.requireUnits;
        delete newDoc.displayUnit;
        delete newDoc.randomiseChoices;
        delete newDoc.showConfidence;
    } else {
        // Remove the requireUnits property as it is no longer applicable to this type of question
        delete newDoc.requireUnits;
        // Remove the disregardSignificantFigures property as it is no longer applicable to this type of question
        delete newDoc.disregardSignificantFigures;
        // Remove the displayUnit property as it is no longer applicable to this type of question
        delete newDoc.displayUnit;
        // Remove the randomiseChoices property as it is no longer applicable to this type of question
        delete newDoc.randomiseChoices;
        // Remove showConfidence property as it is no longer applicable to this type of question
        delete newDoc.showConfidence;
    }

    if (newType === "isaacQuestion") {
        // Remove the defaultFeedback property as it is not applicable to quick questions
        delete newDoc.defaultFeedback;
    }
    
    if (newType === "isaacLLMFreeTextQuestion") {
        // Remove the choices and answer properties as they are not applicable to LLM-Marked questions
        delete newDoc.answer;
        delete newDoc.choices;
        delete newDoc.defaultFeedback;
    }

    if (newType !== "isaacLLMFreeTextQuestion") {
        delete newDoc.markScheme;
        delete newDoc.maxMarks;
        delete newDoc.additionalMarkingInstructions;
        delete newDoc.markingFormula;
        delete newDoc.markingFormulaString;
        delete newDoc.markedExamples;
    }

    if (newType !== "isaacCoordinateQuestion" && newType !== "isaacNumericQuestion") {
        delete newDoc.significantFiguresMin;
        delete newDoc.significantFiguresMax;
    }

    if (newType !== "isaacCoordinateQuestion") {
        delete newDoc.ordered;
        delete newDoc.numberOfCoordinates;
        delete newDoc.numberOfDimensions;
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

export function QuestionMetaPresenter(props: PresenterProps) {
    return <div>
        <div className={styles.questionType}>
            <QuestionTypeSelector {...props} />
        </div>
        <h4><EditableTitleProp {...props} placeHolder="Question title"/></h4>
        <h6><EditableIDProp {...props} label="Question ID"/></h6>
    </div>;
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

export const EditableSignificantFiguresMin = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMin", {label: "from", block: true});
export const EditableSignificantFiguresMax = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMax", {label: "to", block: true});

export function FreeTextQuestionInstructions() {
    return <div>
        <h5>Matching Rule Syntax</h5>
        <Alert color="info">
            A fuller set of instructions can be found <a href="https://github.com/isaacphysics/rutherford-content/wiki/Editor-Notes#free-text-questions" target="_">here</a>.
        </Alert>
        <table className={styles.striped}>
            <thead><tr><th>Symbol</th><th>Description</th><th>Rule</th><th>✓️ Match</th><th>✗ Failed Match</th></tr></thead>
            <tbody>
                <tr>
                    <td className={styles.center}><code>|</code></td>
                    <td>Separate an OR list of word choices</td>
                    <td className={styles.nowrap}><code>JavaScript|[Java&nbsp;Script]|JS</code></td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"JavaScript", "Java Script", "JS"</td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"Java"</td>
                </tr>
                { }
                <tr>
                    <td className={styles.center}><code>.</code></td>
                    <td>Match only one character</td>
                    <td className={styles.center}><code>.a.b.</code></td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"XaXbX"</td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ", "XbXaX"</td>
                </tr>
                <tr>
                    <td className={styles.center}><code>*</code></td>
                    <td>Match zero or more characters</td>
                    <td className={styles.center}><code>*a*b*</code></td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ"</td>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td>"ba", "XbXaX"</td>
                </tr>
            </tbody>
        </table>
    </div>;
}
