import React  from "react";
import {EditableDocPropFor} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {IsaacNumericQuestion, Quantity} from "../../../../isaac-data-types";
import {CheckboxDocProp} from "../../props/CheckboxDocProp";
import {PresenterProps} from "../../registry";
import { EditableSignificantFiguresMax, EditableSignificantFiguresMin, QuestionMetaPresenter } from "./QuestionMetaPresenter";
import { EditableText } from "../../props/EditableText";

export function NumericQuestionPresenter({showMeta = true, ...props}: {showMeta?: boolean} & PresenterProps) {
    const {doc, update} = props;
    const question = doc as IsaacNumericQuestion;

    const EditableDisplayUnit = EditableDocPropFor<IsaacNumericQuestion>("displayUnit",  {label: "Display unit", block: true, format: "latex", previewWrapperChar: "$"});

    const EditableAvailableUnits = ({doc, update}: PresenterProps<IsaacNumericQuestion>) => {
        return <EditableText
            onSave={(newText) => {
                update({
                    ...doc,
                    availableUnits: newText?.split("|").map(unit => unit.trim()),
                });
            }}
            text={doc.availableUnits?.join(" | ")}
            placeHolder="Enter list of units here (|-separated)"
            label="Available units"
            block
        />;
    };

    return <>
        {showMeta && <QuestionMetaPresenter {...props} />}
        <div>
            <CheckboxDocProp doc={question} update={update} prop="disregardSignificantFigures" label="Exact answers only" />
        </div>
        {!question.disregardSignificantFigures && <div className={styles.questionLabel}>
            Significant figures:
            <div className="row">
                <div className="col col-lg-5">
                    <EditableSignificantFiguresMin doc={question} update={update} />
                </div>
                <div className="col col-lg-5">
                    <EditableSignificantFiguresMax doc={question} update={update} />
                </div>
            </div>
        </div>}
        <div>
            <CheckboxDocProp doc={question} update={newQuestion => {
                if (newQuestion.requireUnits) {
                    delete newQuestion.displayUnit;
                } else {
                    delete newQuestion.availableUnits;
                    newQuestion.choices?.forEach(choice => {
                        if (choice.type === "quantity") {
                            delete (choice as Quantity).units;
                        }
                    });
                }
                update(newQuestion);
            }} prop="requireUnits" label="Require choice of units" />
        </div>
        {question.requireUnits ?
            <EditableAvailableUnits doc={question} update={update} />
            :   <EditableDisplayUnit doc={question} update={update} />}
        <div className={styles.questionLabel} /> {/* For spacing */}
    </>;
}
