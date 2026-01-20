import React, {useContext, useEffect, useRef, useState} from 'react';
import {Alert, Container, Spinner} from "reactstrap";

import { AppContext } from "../App";
import { useGithubContents } from "../services/github";
import {decodeBase64} from "../utils/base64";
import CodeMirror, { EditorView, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { spellchecker, wordCounter } from "../utils/codeMirrorExtensions";
import { MarkupToolbar} from "./MarkupToolbar";

import { TopMenu } from "./TopMenu";

import styles from "../styles/editor.module.css";

export function SVGViewer() {
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const {data, error} = useGithubContents(appContext, path);

    const [invalid, setInvalid] = useState(false);
    const [editing, setEditing] = useState(false);

    const codemirror = useRef<ReactCodeMirrorRef>(null);

    useEffect(() => {
        if (data) {
            let decodedContent = null;
            try {
                decodedContent = decodeBase64(data.content) as string;
            } catch {
                // Ignore decoding error
            }
            // eslint-disable-next-line no-control-regex
            if (decodedContent === null || decodedContent.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/)) {
                setInvalid(true);
            } else {
                setInvalid(false);
                appContext.editor.loadNewDoc(decodedContent as string);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (error) {
        return <div className={styles.centered}>
            <Alert color="danger">{error}</Alert>
        </div>;
    }

    if (!data) {
        return <div className={styles.centered}>
            <Spinner size="large" />
        </div>;
    }

    if (invalid) {
        return <div className={styles.centered}>
            <Alert color="warning">This content does not appear to be SVG.</Alert>
        </div>;
    }

    return <div className={styles.editorWrapper}>
        <TopMenu />
        <Container>
            {editing
                ? <CodeMirror
                    ref={codemirror}
                    key={path} // Force replacement of this component instead of updating when path changes
                    className={styles.textEditor}
                    value={appContext.editor.getCurrentDocAsString()}
                    height="calc(100vh - 100px)"
                    width="100%"
                    extensions={[EditorView.lineWrapping, wordCounter(), spellchecker()]}
                    onChange={(value) => {
                        appContext.editor.setCurrentDoc(value);
                    }}
                >
                    <MarkupToolbar set={() => setEditing(false)} cancel={() => setEditing(false)} codemirror={codemirror} encoding={"plaintext"} />
                </CodeMirror>
                : <button title={"Edit SVG"} className={styles.centerImage} dangerouslySetInnerHTML={{__html: appContext.editor.getCurrentDocAsString()}} onClick={() => setEditing(true)} />
            }
        </Container>
    </div>;
}
