import React from "react";

import { CodeSnippet } from "../../../isaac-data-types";

import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { EditableDocPropFor } from "../props/EditableDocProp";
import { PresenterProps } from "../registry";
import {EnumPropFor} from "../props/EnumProp";

const EditableCode = EditableDocPropFor<CodeSnippet>("code", {format: "code"});
const EditableUrl = EditableDocPropFor<CodeSnippet>("url");

const Languages = {
    assembly: "Assembly",
    csharp: "C#",
    css: "CSS",
    haskell: "Haskell",
    html: "HTML / XML",
    pseudocode: "Isaac Pseudocode",
    java: "Java",
    javascript: "Javascript",
    php: "PHP",
    python: "Python",
    sql: "SQL",
    vba: "Visual Basic",
};
const LanguageSelector = EnumPropFor<CodeSnippet>("language", Languages);

export function CodeSnippetPresenter(props: PresenterProps<CodeSnippet>) {
    return <>
        <LanguageSelector {...props} />
        <CheckboxDocProp {...props} prop="disableHighlighting" label="Disable highlighting" />
        <EditableCode {...props} label="Code" block />
        <EditableUrl {...props} label="Url" block />
    </>;
}
