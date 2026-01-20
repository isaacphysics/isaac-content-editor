import React from "react";
import { GeogebraEmbedding } from "../../../isaac-data-types";
import {
    EditableDocPropFor,
} from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";
import { CheckboxDocProp } from "../props/CheckboxDocProp";
import classNames from "classnames";
import { EnumPropFor } from "../props/EnumProp";

const EditableMaterialId = EditableDocPropFor<GeogebraEmbedding>("materialId");
const EditableAltText = EditableDocPropFor<GeogebraEmbedding>("altText");

const AppTypes = {
    classic: "Classic",
    graphing: "Graphing",
    geometry: "Geometry",
    "3d": "3D",
};

const EditableAppType = EnumPropFor<GeogebraEmbedding>("appType", AppTypes);

export function GeogebraEmbeddingPresenter(props: PresenterProps<GeogebraEmbedding>) {
    const {doc, update} = props;
    return <>
        <div className={classNames(styles.figureWrapper, "d-flex flex-column")}>
            <EditableMaterialId {...props} label="Material ID" />
            <div className="d-flex align-items-center">
                <span className="pe-2 pr-2">Set app type:</span>
                <EditableAppType {...props} />
                <button className="btn btn-link p-0 mt-0" onClick={() => {
                    update({...doc, appType: undefined});
                }}>✖️</button>
            </div>

            <div className="d-flex flex-column">
                <CheckboxDocProp {...props} prop="allowNewInputs" label="Allow user to enter new equations" />
            </div>
            <div className={styles.figureCaption}>
                <EditableAltText {...props} label="Alt text" />
            </div>
        </div>
    </>;
}
