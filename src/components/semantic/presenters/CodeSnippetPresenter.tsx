import React, { useState } from "react";

import { CodeSnippet } from "../../../isaac-data-types";

import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { EditableDocPropFor } from "../props/EditableDocProp";
import { PresenterProps } from "../registry";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const EditableCode = EditableDocPropFor<CodeSnippet>("code", { format: "code" });
const EditableUrl = EditableDocPropFor<CodeSnippet>("url");

const Languages = {
  python: "Python",
  javascript: "Javascript",
  csharp: "C#",
  php: "PHP",
  sql: "SQL",
  assembly: "Assembly",
  pseudocode: "Isaac Pseudocode",
};

function LanguageSelector({ doc, update }: PresenterProps<CodeSnippet>) {
  const [isOpen, setOpen] = useState(false);

  const language = Languages[doc.language as keyof typeof Languages];

  return (
    <Dropdown toggle={() => setOpen((toggle) => !toggle)} isOpen={isOpen}>
      <DropdownToggle caret>{language}</DropdownToggle>
      <DropdownMenu>
        {Object.entries(Languages).map(([key, possibleType]) => {
          return (
            <DropdownItem
              key={key}
              active={language === possibleType}
              onClick={() => {
                if (language !== possibleType) {
                  update({
                    ...doc,
                    language: key,
                  });
                }
              }}
            >
              {possibleType}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

export function CodeSnippetPresenter(props: PresenterProps<CodeSnippet>) {
  return (
    <>
      <LanguageSelector {...props} />
      <CheckboxDocProp {...props} prop="disableHighlighting" label="Disable highlighting" />
      <EditableCode {...props} label="Code" block />
      <EditableUrl {...props} label="Url" block />
    </>
  );
}
