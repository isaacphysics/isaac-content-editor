import React, {createContext, useContext} from "react";
import {EditableDimensionalDocProp, EditableDocPropFor} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {Button} from "reactstrap";
import {IsaacCoordinateQuestion} from "../../../../isaac-data-types";
import {CheckboxDocProp} from "../../props/CheckboxDocProp";
import {PresenterProps} from "../../registry";
import {NumberDocPropFor} from "../../props/NumberDocPropFor";
import {InserterProps} from "../ListChildrenPresenter";
import { EditableSignificantFiguresMax, EditableSignificantFiguresMin, QuestionFooterPresenter, QuestionMetaPresenter } from "./questionPresenters";

export const CoordinateQuestionContext = createContext<{numberOfCoordinates?: number, numberOfDimensions?: number}>({});


export function CoordinateQuestionPresenter(props: PresenterProps<IsaacCoordinateQuestion>) {
    const {doc, update} = props;
    const question = doc as IsaacCoordinateQuestion;

    const EditableNumberOfCoordinates = NumberDocPropFor<IsaacCoordinateQuestion>("numberOfCoordinates", {label: "Number of coordinates", block: true});
    const EditableDimensions = NumberDocPropFor<IsaacCoordinateQuestion>("numberOfDimensions", {label: "Dimensions", block: true});    
    const EditableSeparator = EditableDocPropFor<IsaacCoordinateQuestion>("separator", {label: "Separator", block: true});
    const EditableButtonText = EditableDocPropFor<IsaacCoordinateQuestion>("buttonText", {label: "\"Add coordinate\" button text override", block: true});
    const EditablePlaceholderValuesProp = EditableDimensionalDocProp<IsaacCoordinateQuestion>("placeholderValues");
    const EditablePrefixesProp = EditableDimensionalDocProp<IsaacCoordinateQuestion>("prefixes");
    const EditableSuffixesProp = EditableDimensionalDocProp<IsaacCoordinateQuestion>("suffixes");

    return <>
        <QuestionMetaPresenter {...props} />
        <EditableNumberOfCoordinates {...props} />
        <CheckboxDocProp {...props} prop="ordered" label="Require that order of coordinates in choice and answer are the same" />
        <EditableDimensions {...props} />
        <CheckboxDocProp {...props} prop="useBrackets" checkedIfUndefined label="Show brackets around coordinates" />
        <EditableSeparator {...props} />
        <EditableButtonText {...props} />
        <div className={styles.questionLabel}>
            Coordinate labels:<br/>
            <small><em>Placeholders do not accept latex. Please use a unicode equivalent such as Ψ₁.</em></small>
            <div>
                {[...Array(question.numberOfDimensions)].map((_, i) => 
                    <div className={"mb-3"} key={i}>
                        <EditablePrefixesProp {...props} dimension={i} label={"Prefix ".concat((i+1).toString())} />
                        <span className="mx-2"/>
                        <EditablePlaceholderValuesProp {...props} dimension={i} label={"Placeholder ".concat((i+1).toString())} />
                        <span className="mx-2"/>
                        <EditableSuffixesProp {...props} dimension={i} label={"Suffix ".concat((i+1).toString())} />
                    </div>
                )}
            </div>
            <div>
                <CheckboxDocProp doc={question} update={update} prop="disregardSignificantFigures" label="Exact answers only" />
            </div>
            Significant figures (affects all values):
            <div className="row mt-2">
                <div className="col col-lg-5">
                    <EditableSignificantFiguresMin {...props} />
                </div>
                <div className="col col-lg-5">
                    <EditableSignificantFiguresMax {...props} />
                </div>
            </div>
        </div>
    </>;
}

export function CoordinateQuestionFooterPresenter(props: PresenterProps<IsaacCoordinateQuestion>) {
    const question = props.doc as IsaacCoordinateQuestion;

    return <CoordinateQuestionContext.Provider value={{
        numberOfCoordinates: question.numberOfCoordinates,
        numberOfDimensions: question.numberOfDimensions
    }}>
        <QuestionFooterPresenter {...props} />
    </CoordinateQuestionContext.Provider>;
}

export function CoordinateChoiceItemInserter({insert, position, lengthOfCollection}: InserterProps) {
    const numberOfCoordinates = useContext(CoordinateQuestionContext).numberOfCoordinates;
    if (position !== lengthOfCollection) {
        return null; // Only include an insert button at the end.
    }
    if (numberOfCoordinates !== undefined && lengthOfCollection >= numberOfCoordinates) {
        return null; // Max items reached in choice
    }
    return <Button className={styles.itemsChoiceInserter} color="primary" onClick={() => {
        insert(position, {type: "coordinateItem"});
    }}>Add</Button>;
}
