import React, {
    MutableRefObject,
    useContext,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import PropTypes from "prop-types";

import { AppContext } from "../../App";

import { Entry } from "../FileBrowser";

import styles from "../../styles/editor.module.css";
import { githubReplaceWithConfig } from "../../services/github";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";

export type PopupEntry = Entry & {
    refresh?: () => void;
};

export interface PopupMenuRef {
    open: (event: React.MouseEvent, item: PopupEntry) => void;
}

type MenuItemProps =
    | {
        onClick: () => void;
        href?: never;
        text: string;
    }
    | {
        onClick?: never;
        href: string;
        text: string;
    }
;

export function MenuItem({
    onClick,
    href,
    text
}: MenuItemProps) {
    const close = useContext(PopupCloseContext);
    if (onClick) {
        return <li>
            <button onClick={() => {
                onClick();
                close?.();
            }}>{text}</button>
        </li>;
    } else {
        return <li><a href={href} target="_blank">{text}</a></li>;
    }
}

export const buildPopupMenu = (PopupInner: React.FC<{item: PopupEntry}>, displayName?: string) => {
    const PopupMenu = ({menuRef}: { menuRef: MutableRefObject<PopupMenuRef | null> }) => {
        const [item, setItem] = useState<PopupEntry>(undefined as unknown as PopupEntry);
        const popupRef = useRef<PopupRef>(null);
        useImperativeHandle(menuRef, () => ({
            open: (event, item) => {
                setItem(item);
                popupRef.current?.open(event);
            }
        }), [setItem]);

        return <Popup popUpRef={popupRef}>
            <ul className={styles.leftMenuPopupMenu}>
                <PopupInner item={item}/>
            </ul>
        </Popup>;
    };
    PopupMenu.displayName = displayName ?? PopupInner.displayName;
    return PopupMenu;
};

export const FilesPopupMenuInner = ({item}: {item: PopupEntry}) => {
    const appContext = useContext(AppContext);
    const isCurrentFile = item?.path === appContext.selection.getSelection()?.path;
    return <>
        {item?.type === "dir" && <MenuItem onClick={() => appContext.dispatch({
            type: "new",
            path: item.path
        })} text="New..."/>}
        <MenuItem onClick={() => appContext.dispatch({
            type: "openInNewTab",
            path: item.path
        })} text="Open in new tab"/>
        {item?.type === "dir" && item.refresh && <>
            <hr/>
            <MenuItem onClick={() => item.refresh?.()} text="Refresh"/>
        </>}
        {item?.type === "file" && isCurrentFile && <MenuItem onClick={() => appContext.dispatch({
            type: "rename",
            path: item.path,
            name: item.name,
        })} text="Rename..."/>}
        {item?.type === "file" && isCurrentFile && <MenuItem onClick={() => appContext.dispatch({
            type: "saveAs",
            path: item.path,
            name: item.name,
        })} text="Save as..."/>}
        {item?.type === "file" && <MenuItem onClick={() => appContext.dispatch({
            type: "delete",
            path: item.path,
            name: item.name,
            sha: item.sha,
        })} text="Delete"/>}
        {item?.type === "file" && <hr/>}
        {item?.type === "file" && <MenuItem href={
            `${githubReplaceWithConfig("https://github.com/$OWNER/$REPO/blob")}/${appContext.github.branch}/${item.path}`
        } text="View on GitHub"/>}
        {item?.type === "file" && <MenuItem
            href={`${githubReplaceWithConfig("https://github.com/$OWNER/$REPO/issues/new")}?body=${encodeURIComponent(
                `Issue found in https://editor.isaacphysics.org/edit/master/${item.path}.\n\n<Describe issue here>`
            )}`} text="Report issue on GitHub"/>}
    </>;
};

export const PopupMenu = buildPopupMenu(FilesPopupMenuInner, "PopupMenu");
