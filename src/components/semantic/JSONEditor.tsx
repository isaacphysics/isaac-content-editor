import React, {useRef, useState} from "react";
import {Button} from "reactstrap";
import CodeMirror, {EditorView, rectangularSelection} from "@uiw/react-codemirror";
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {Diagnostic, linter, lintGutter} from "@codemirror/lint";
import {syntaxTree} from "@codemirror/language";

import {PresenterProps} from "./registry";
import styles from "./styles/semantic.module.css";
import {keyBindings, spellchecker} from "../../utils/codeMirrorExtensions";
import {MarkupToolbar} from "../MarkupToolbar";

const regexpLinter = linter(view => {
    const diagnostics: Diagnostic[] = [];
    let isValidObject = false;
    syntaxTree(view.state).cursor().iterate(node => {
        console.log("JSONEditor: ", node.name, node.from, node.to, view.state.doc.sliceString(node.from, node.to));
        if (!isValidObject) {
            if (node.name === "JsonText") {
                return;
            } else if (node.name === "Object") {
                isValidObject = true;
            } else {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: "error",
                    message: "JSON files must contain a single object at the top level",
                });
            }
        }
    });
    return diagnostics;
});

const extensions = [json(), EditorView.lineWrapping, linter(jsonParseLinter()), regexpLinter, lintGutter(), rectangularSelection(), spellchecker()];
const empty = Symbol("empty") as unknown as string;

export function JSONEditor({doc, update, close}: PresenterProps & { close: () => void }) {
    const value = useRef(empty);
    if (value.current === empty) {
        value.current = JSON.stringify(doc, null, 2);
    }
    const [valid, setValid] = useState(true);

    function setDocChanges() {
        if (valid) {
            update(JSON.parse(value.current));
            close();
        } else {
            console.error("Cannot set changes, JSON is invalid: ", value.current);
        }
        return true;
    }

    function cancelDocChanges() {
        value.current = JSON.stringify(doc, null, 2);
        close();
        return true;
    }

    return <>
        <CodeMirror
            value={value.current}
            maxHeight="calc(100vh - 120px)"
            extensions={[extensions, keyBindings(setDocChanges, cancelDocChanges)]}
            onChange={(newValue) => {
                value.current = newValue;
                try {
                    const a = JSON.parse(newValue);
                    console.log("Validating JSON: ", newValue, a);
                    if (typeof a !== "object" || a === null || Array.isArray(a)) {
                        throw new Error("Not an object");
                    }
                    setValid(true);
                } catch (e) {
                    console.error(e);
                    setValid(false);
                }
            }}
        >
            <MarkupToolbar set={setDocChanges} cancel={cancelDocChanges} encoding={doc.encoding} />
        </CodeMirror>
        <div className={`mt-2 ${styles.editButtons}`}>
            <Button onClick={cancelDocChanges}>Cancel</Button>
            <Button color="primary" disabled={!valid} onClick={setDocChanges}>Set</Button>
        </div>
    </>;
}
