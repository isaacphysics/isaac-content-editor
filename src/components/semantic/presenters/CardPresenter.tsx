import React from "react";

import { IsaacCard, IsaacCardDeck } from "../../../isaac-data-types";

import { PresenterProps } from "../registry";
import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { SemanticDocProp } from "../props/SemanticDocProp";
import { EditableDocPropFor, EditableSubtitleProp, EditableTitleProp } from "../props/EditableDocProp";
import { ListPresenterProp } from "../props/listProps";

const EditableURL = EditableDocPropFor<IsaacCard>("clickUrl");

export function CardPresenter(props: PresenterProps<IsaacCard>) {
  return (
    <>
      <h2>
        <EditableTitleProp {...props} placeHolder="Card title" />
      </h2>
      <EditableSubtitleProp {...props} placeHolder="Card text" />
      <EditableURL {...props} label="Link URL" block />
      <div>
        <CheckboxDocProp {...props} prop="verticalContent" label="Vertical layout" />
        <CheckboxDocProp {...props} prop="disabled" label="Link disabled" />
      </div>
      <SemanticDocProp {...props} prop="image" />
    </>
  );
}

export function CardDeckPresenter(props: PresenterProps<IsaacCardDeck>) {
  return (
    <>
      <h1>
        <EditableTitleProp {...props} placeHolder="Card deck title" />
      </h1>
      <ListPresenterProp {...props} prop="cards" childTypeOverride="isaacCard" />
    </>
  );
}
