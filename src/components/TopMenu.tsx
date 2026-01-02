import React, {useContext, useRef, useState} from "react";

import {AppContext} from "../App";
import {useGithubContents} from "../services/github";

import {PopupMenu, PopupMenuRef} from "./popups/PopupMenu";
import {Entry} from "./FileBrowser";

import styles from "../styles/editor.module.css";
import {Content} from "../isaac-data-types";
import {LiveServer, StagingServer} from "../services/isaacApi";
import classNames from "classnames";
import {BOOK_DETAIL_ID_SEPARATOR} from "../services/constants";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

function filePathToEntry(path: string | undefined, sha: string): Entry {
    const name = path?.substring(path?.lastIndexOf("/") + 1) ?? "";
    return {type: "file", path: path as string, name, sha};
}

function getPreviewLink(doc: Content, server=StagingServer) {
    if (doc && doc.id) {
        switch (doc.type) {
            case "isaacConceptPage":
                return `${server}/concepts/${doc.id}`;
            case "isaacQuestionPage":
            case "isaacFastTrackQuestionPage":
                return `${server}/questions/${doc.id}`;
            case "isaacTopicSummaryPage":
                return `${server}/topics/${doc.id.slice("topic_summary_".length)}`;
            case "isaacEventPage":
                return `${server}/events/${doc.id}`;
            case "page":
                return `${server}/pages/${doc.id}`;
            case "isaacQuiz":
                return `${server}/test/preview/${doc.id}`;
            case "isaacBookDetailPage": {
                const pageId = doc.id.split(BOOK_DETAIL_ID_SEPARATOR).pop() || "";
                return `${server}/books/${doc.id.slice("book_".length, -(pageId.length + BOOK_DETAIL_ID_SEPARATOR.length))}/${pageId}`;
            }
            case "isaacBookIndexPage":
                return `${server}/books/${doc.id.slice("book_".length)}`;
        }
    }
}

export function TopMenu({previewable, undoable}: {previewable?: boolean; undoable?: boolean}) {
    const menuRef = useRef<PopupMenuRef>(null);
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const {data} = useGithubContents(appContext, selection?.path);

    const [isOpen, setOpen] = useState(false);

    let previewLink: string | undefined;
    let liveLink: string | undefined;
    try {
        previewLink = getPreviewLink(appContext.editor.getCurrentDoc());
        liveLink = getPreviewLink(appContext.editor.getCurrentDoc(), LiveServer);
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
        {selection && !selection.isDir && <Dropdown className="d-flex" isOpen={isOpen} toggle={() => setOpen(open => !open)}>
            <DropdownToggle className={classNames(styles.iconButton, "px-1")}>▼</DropdownToggle>
            <DropdownMenu>
                {liveLink && <DropdownItem>
                    <a href={liveLink} target="_blank">View on live</a>
                </DropdownItem>}
                <DropdownItem>
                    <a href={`${StagingServer}/admin/content_errors?path=${selection.path}`} target="_blank">View content errors</a>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>}
        <PopupMenu menuRef={menuRef} />
    </div>;
}
