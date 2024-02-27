import React from "react";

import { EmailTemplate } from "../../../isaac-data-types";

import { EditableDocPropFor } from "../props/EditableDocProp";
import { PresenterProps } from "../registry";
import { BaseValuePresenter } from "./BaseValuePresenter";
import { Box } from "../SemanticItem";

const EditableSubject = EditableDocPropFor<EmailTemplate>("subject");

export function EmailTemplatePresenter(props: PresenterProps<EmailTemplate>) {
  const { doc, update } = props;
  return (
    <>
      <EditableSubject {...props} label="Subject" block />
      <Box name="Plain text">
        <BaseValuePresenter
          doc={{ value: doc.plainTextContent, encoding: "plain" }}
          update={(newContent) => {
            update({ ...doc, plainTextContent: newContent.value });
          }}
        />
      </Box>
      <Box name="HTML content">
        <BaseValuePresenter
          doc={{ value: doc.htmlContent, encoding: "html" }}
          update={(newContent) => {
            update({ ...doc, htmlContent: newContent.value });
          }}
        />
        <br />
      </Box>
    </>
  );
}
