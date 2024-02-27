import React from "react";

import { Video } from "../../../isaac-data-types";

import { EditableDocPropFor } from "../props/EditableDocProp";
import styles from "../styles/figure.module.css";
import { PresenterProps } from "../registry";

const EditableSrc = EditableDocPropFor<Video>("src");
const EditableAltText = EditableDocPropFor<Video>("altText");

export function VideoPresenter(props: PresenterProps<Video>) {
  return (
    <>
      <div className={styles.figureWrapper}>
        <div className={styles.figureImage}>
          <EditableSrc {...props} label="Video source" />
        </div>
        <div className={styles.figureCaption}>
          <EditableAltText {...props} label="Alt text" />
        </div>
      </div>
    </>
  );
}
