import React from "react";

import { Video } from "../../../isaac-data-types";

import {
    EditableDocPropFor,
} from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";
import { isDefined } from "../../../utils/types";
import { generateGuid } from "../../../utils/strings";

const EditableSrc = EditableDocPropFor<Video>("src");
const EditableAltText = EditableDocPropFor<Video>("altText");

export function VideoPresenter(props: PresenterProps<Video>) {
    if (!isDefined(props.doc.id)) {
        props.update({...props.doc, id: generateGuid()});
    }

    return <>
        <div className={styles.figureWrapper}>
            <div className={styles.figureImage}>
                <EditableSrc {...props} label="Video source" />
            </div>
            <div className={styles.figureCaption}>
                <EditableAltText {...props} label="Alt text" />
            </div>
        </div>
    </>;
}
