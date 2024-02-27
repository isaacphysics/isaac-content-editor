import React from "react";

import { IsaacPod } from "../../../isaac-data-types";

import { PresenterProps } from "../registry";
import { EditableDocPropFor, EditableTitleProp, EditableValueProp } from "../props/EditableDocProp";
import { SemanticDocProp } from "../props/SemanticDocProp";

const EditableUrlProp = EditableDocPropFor<IsaacPod>("url");

export function PodPresenter(props: PresenterProps<IsaacPod>) {
  return (
    <>
      <h4>
        <EditableTitleProp {...props} label="Title" />
      </h4>
      <EditableValueProp {...props} label="Pod text" block />
      <EditableUrlProp {...props} label="Url" placeHolder="Pod link Url" block />
      <SemanticDocProp {...props} prop="image" />
    </>
  );
}
