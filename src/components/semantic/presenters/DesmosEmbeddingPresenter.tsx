import React from "react";
import { DesmosEmbedding } from "../../../isaac-data-types";
import {
    EditableDocPropFor,
    EditableDropdownDocPropFor,
} from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";
import { ContentValueOrChildrenPresenter } from "./ContentValueOrChildrenPresenter";

const EditableCalculatorId = EditableDocPropFor<DesmosEmbedding>("calculatorId");
const EditableCalculatorType = EditableDropdownDocPropFor<DesmosEmbedding>("calculatorType", [
    {value: undefined, label: "2D (Default)"},
    {value: "3d", label: "3D"},
], "Calculator type:", {value: undefined, label: "2D (Default)"}, {block: true});

export function DesmosEmbeddingPresenter(props: PresenterProps<DesmosEmbedding>) {
    return <>
        <div className={styles.figureWrapper}>
            <div className={styles.figureImage}>
                <EditableCalculatorId {...props} label="Calculator ID" />
                <EditableCalculatorType {...props} label="Calculator Type" />
            </div>
            <div className={styles.figureCaption}>
                <ContentValueOrChildrenPresenter {...props} topLevel />
            </div>
        </div>
    </>;
}
