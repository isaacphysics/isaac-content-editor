import React, { useContext, useRef } from "react";

import { AppContext } from "../App";
import { useGithubContents } from "../services/github";

import { PopupMenu, PopupMenuRef } from "./popups/PopupMenu";
import { Entry } from "./FileBrowser";

import styles from "../styles/editor.module.css";
import {Content} from "../isaac-data-types";
import {StagingServer} from "../services/isaacApi";

function filePathToEntry(path: string | undefined, sha: string): Entry {
    const name = path?.substring(path?.lastIndexOf("/") + 1) ?? "";
    return {type: "file", path: path as string, name, sha};
}

function getPreviewLink(doc: Content) {
    if (doc && doc.id) {
        switch (doc.type) {
            case "isaacConceptPage":
                return `${StagingServer}/concepts/${doc.id}`;
            case "isaacQuestionPage":
            case "isaacFastTrackQuestionPage":
                return `${StagingServer}/questions/${doc.id}`;
            case "isaacTopicSummaryPage":
                return `${StagingServer}/topics/${doc.id.slice("topic_summary_".length)}`;
            case "isaacEventPage":
                return `${StagingServer}/events/${doc.id}`;
            case "page":
                return `${StagingServer}/pages/${doc.id}`;
            case "isaacQuiz":
                return `${StagingServer}/quiz/preview/${doc.id}`;
        }
    }
}

export function TopMenu({previewable}: {previewable?: boolean}) {
    const menuRef = useRef<PopupMenuRef>(null);
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const {data} = useGithubContents(appContext, selection?.path);

    let previewLink: string | undefined;
    try {
        previewLink = getPreviewLink(appContext.editor.getCurrentDoc());
    } catch {
        // No current doc so no preview
    }

    return <div className={styles.topMenuWrapper}>
        <button className={styles.iconButton} onClick={(event) => selection && menuRef.current?.open(event, filePathToEntry(selection.path, data.sha))}>
            ☰<span className="d-none d-lg-inline"> Menu</span>
        </button>
        <div className={styles.flexFill} />
        {appContext.editor.getDirty() &&
            <button className={styles.iconButton} onClick={() => appContext.dispatch({"type": "save"})}>
                💾<span className="d-none d-lg-inline"> Save</span>
            </button>}
        {selection && !selection.isDir && previewLink && <button onClick={() => window.open(previewLink, "_blank")} className={styles.iconButton} >
            Staging
        </button>}
        {selection && previewable && !appContext.preview.open && <button className={styles.iconButton} onClick={() => {
            appContext.preview.toggle();
        }}>
            Preview
        </button>}
        <PopupMenu menuRef={menuRef} />
    </div>;
}
