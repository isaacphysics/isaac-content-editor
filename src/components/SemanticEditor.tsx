import React, {useContext, useEffect, useMemo} from 'react';
import { Alert, Spinner } from "reactstrap";

import { AppContext } from "../App";
import { decodeBase64 } from "../utils/base64";
import { Content } from '../isaac-data-types';
import { SemanticRoot } from "./semantic/SemanticRoot";

import styles from "../styles/editor.module.css";
import { useGithubContents } from "../services/github";
import { TopMenu } from "./TopMenu";


export interface EditorState {
    getDirty: () => boolean;
    canUndo: () => boolean;
    undo: () => void;
    getCurrentDoc: () => Content;
    getCurrentDocAsString: () => string;
    getCurrentDocExt: () => string;
    getCurrentDocPath: () => string | undefined;
    setDirty: (isDirty: boolean) => void;
    setCurrentDoc: (newContent: Content | string, invertible?: boolean) => void;
    loadNewDoc: (newContent: Content | string) => void;
    isAlreadyPublished: () => boolean;
}

export const defaultEditorState: EditorState = {
    getDirty: () => false,
    canUndo: () => false,
    undo: () => {
        throw new Error("undo called outside of AppContent");
    },
    getCurrentDoc: () => ({}),
    getCurrentDocAsString: () => "",
    getCurrentDocExt: () => "",
    getCurrentDocPath: () => undefined,
    setDirty: () => {
        throw new Error('setDirty called outside of AppContent');
    },
    setCurrentDoc: () => {
        throw new Error("setCurrentDoc called outside of AppContent");
    },
    loadNewDoc: () => {
        throw new Error("loadNewDoc called outside of AppContent");
    },
    isAlreadyPublished: () => false,
};

function decodeContent(data: {content: string}) {
    return JSON.parse(decodeBase64(data.content) as string);
}

export function SemanticEditor() {
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const {data, error} = useGithubContents(appContext, selection && !selection.isDir && path);

    useEffect(() => {
        if (data) {
            const decodedContent = decodeContent(data);
            appContext.editor.loadNewDoc(decodedContent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (error) {
        return <div className={styles.centered}>
            <Alert color="danger">{error}</Alert>
        </div>;
    }

    // If we don't have github data yet, or the doc is waiting to be updated, then show a spinner
    if (!data || (appContext.selection.getSelection()?.path !== appContext.editor.getCurrentDocPath())) {
        return <div className={styles.centered}>
            <Spinner size="large" />
        </div>;
    }

    return <div className={styles.editorWrapper}>
        <TopMenu previewable undoable />
        <div className={styles.editorScroller}>
            <SemanticRoot doc={appContext.editor.getCurrentDoc()} update={(newContent, invertible) => {
                appContext.editor.setCurrentDoc(newContent, invertible);
            }} />
        </div>
    </div>;
}
