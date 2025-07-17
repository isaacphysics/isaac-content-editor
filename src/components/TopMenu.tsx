import React, {useContext, useRef} from "react";

import {AppContext} from "../App";
import {useGithubContents} from "../services/github";

import {PopupMenu, PopupMenuRef} from "./popups/PopupMenu";
import {Entry} from "./FileBrowser";

import styles from "../styles/editor.module.css";
import {Content} from "../isaac-data-types";
import {StagingServer} from "../services/isaacApi";
import classNames from "classnames";
import {BOOK_DETAIL_ID_SEPARATOR} from "../services/constants";

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
            case "isaacBookDetailPage": {
                const pageId = doc.id.split(BOOK_DETAIL_ID_SEPARATOR).pop() || "";
                return `${StagingServer}/books/${doc.id.slice("book_".length, -(pageId.length + BOOK_DETAIL_ID_SEPARATOR.length))}/${pageId}`;
            }
            case "isaacBookIndexPage":
                return `${StagingServer}/books/${doc.id.slice("book_".length)}`;
        }
    }
}

export function TopMenu({previewable, undoable}: {previewable?: boolean; undoable?: boolean}) {
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
        <button title={"Open menu"} className={styles.iconButton} onClick={(event) => selection && menuRef.current?.open(event, filePathToEntry(selection.path, data.sha))}>
            ☰<span className="d-none d-lg-inline"> Menu</span>
        </button>
        <div className={styles.flexFill} />
        {appContext.editor.getDirty() &&
            <button title={"Save changes"} className={styles.iconButton} onClick={() => appContext.dispatch({"type": "save"})}>
                💾<span className="d-none d-lg-inline"> Save</span>
            </button>}
        {undoable && appContext.editor.canUndo() && <button className={classNames(styles.iconButton, styles.undoButton)} onClick={appContext.editor.undo}>
                ↺<span className="d-none d-lg-inline"> Undo</span>
            </button>}
        {selection && !selection.isDir && previewLink && <a href={previewLink} target="_blank" className={styles.iconButton} >
            Staging
        </a>}
        <PopupMenu menuRef={menuRef} />
    </div>;
}
