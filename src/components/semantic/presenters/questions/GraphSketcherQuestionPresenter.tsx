import React from "react";
import {EditableDocPropFor} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {IsaacCoordinateQuestion, IsaacGraphSketcherQuestion} from "../../../../isaac-data-types";
import {PresenterProps} from "../../registry";
import {NumberDocPropFor} from "../../props/NumberDocPropFor";
import { QuestionMetaPresenter } from "./QuestionMetaPresenter";

export function GraphSketcherQuestionPresenter(props: PresenterProps<IsaacGraphSketcherQuestion>) {
    const {doc, update} = props;
    const question = doc as IsaacCoordinateQuestion;

    const NumCurvesInput = NumberDocPropFor<IsaacGraphSketcherQuestion>("maxNumCurves", {label: "Max number of curves", block: true});
    const EditableAxisLabelX = EditableDocPropFor<IsaacGraphSketcherQuestion>("axisLabelX", {label: "X-axis", block: true, format: "latex", previewWrapperChar: "$"});
    const EditableAxisLabelY = EditableDocPropFor<IsaacGraphSketcherQuestion>("axisLabelY", {label: "Y-axis", block: true, format: "latex", previewWrapperChar: "$"});

    return <>
        <QuestionMetaPresenter {...props} />
        <div className={styles.questionLabel}>
            Axis labels:
            <div className="row">
                <div className="col col-lg-5">
                    <EditableAxisLabelX doc={question} update={update} />
                </div>
                <div className="col col-lg-5">
                    <EditableAxisLabelY doc={question} update={update} />
                </div>
            </div>
            <div className="row">
                <div className="col col-lg-5">
                    <NumCurvesInput doc={question} update={update} />
                </div>
            </div>
        </div>
    </>;
}
