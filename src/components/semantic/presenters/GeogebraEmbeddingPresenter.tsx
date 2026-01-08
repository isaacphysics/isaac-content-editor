import React from "react";
import { GeogebraEmbedding } from "../../../isaac-data-types";
import {
    EditableDocPropFor,
} from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";

const EditableAppId = EditableDocPropFor<GeogebraEmbedding>("appId");
const EditableAltText = EditableDocPropFor<GeogebraEmbedding>("altText");

export function GeogebraEmbeddingPresenter(props: PresenterProps<GeogebraEmbedding>) {
    return <>
        <div className={styles.figureWrapper}>
            <div className={styles.figureImage}>
                <EditableAppId {...props} label="App ID" />
            </div>
            <div className={styles.figureCaption}>
                <EditableAltText {...props} label="Alt text" />
            </div>
        </div>
    </>;
}
