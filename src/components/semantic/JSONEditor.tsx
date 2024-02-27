import React, { useRef, useState } from "react";
import { Button } from "reactstrap";
import CodeMirror, { EditorView, rectangularSelection } from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

import { PresenterProps } from "./registry";
import styles from "./styles/semantic.module.css";
import { keyBindings, spellchecker } from "../../utils/codeMirrorExtensions";
import { MarkupToolbar } from "../MarkupToolbar";

const extensions = [
  json(),
  EditorView.lineWrapping,
  linter(jsonParseLinter()),
  lintGutter(),
  rectangularSelection(),
  spellchecker(),
];
const empty = Symbol("empty") as unknown as string;

export function JSONEditor({ doc, update, close }: PresenterProps & { close: () => void }) {
  const value = useRef(empty);
  if (value.current === empty) {
    value.current = JSON.stringify(doc, null, 2);
  }
  const [valid, setValid] = useState(true);

  function setDocChanges() {
    update(JSON.parse(value.current));
    close();
    return true;
  }

  function cancelDocChanges() {
    value.current = JSON.stringify(doc, null, 2);
    close();
    return true;
  }

  return (
    <>
      <CodeMirror
        value={value.current}
        maxHeight="calc(100vh - 120px)"
        extensions={[extensions, keyBindings(setDocChanges, cancelDocChanges)]}
        onChange={(newValue) => {
          value.current = newValue;
          try {
            JSON.parse(newValue);
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
        <Button color="primary" disabled={!valid} onClick={setDocChanges}>
          Set
        </Button>
      </div>
    </>
  );
}
