import React from "react";
import { DesmosEmbedding } from "../../../isaac-data-types";
import {
    EditableDocPropFor,
} from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";

const EditableCalculatorId = EditableDocPropFor<DesmosEmbedding>("calculatorId");
const EditableAltText = EditableDocPropFor<DesmosEmbedding>("altText");

export function DesmosEmbeddingPresenter(props: PresenterProps<DesmosEmbedding>) {
    return <>
        <div className={styles.figureWrapper}>
            <div className={styles.figureImage}>
                <EditableCalculatorId {...props} label="Calculator ID" />
            </div>
            <div className={styles.figureCaption}>
                <EditableAltText {...props} label="Alt text" />
            </div>
        </div>
    </>;
}
