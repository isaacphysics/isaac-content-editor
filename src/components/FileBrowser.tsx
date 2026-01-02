import React, {
    ComponentProps,
    createContext,
    FunctionComponent,
    MutableRefObject,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { ListGroup, ListGroupItem, Spinner, } from "reactstrap";

import { AppContext } from "../App";
import styles from "../styles/editor.module.css";
import { PopupMenu, PopupMenuRef } from "./popups/PopupMenu";
import {GitHubRepository, useGithubContents} from "../services/github";

export type Entry = {
    type: "file";
    name: string;
    path: string;
    sha: string;
} | {
    type: "dir";
    name: string;
    path: string;
    sha: string;
};

interface FilesProps {
    entry?: Entry;
    menuRef: MutableRefObject<PopupMenuRef | null>;
}

type FileItemProps = Omit<ComponentProps<typeof ListGroupItem>, "onClick"> & {
    entry: Entry;
    onClick?: (isSelected: boolean) => void;
};

export function pathToId(path: string) {
    return `fileItem-${path.replaceAll(/[^a-zA-Z0-9-_]/g, "-")}`;
}

export const FilesContext = createContext<{setSelection?: (selection: Selection) => void; selectionPath?: string; repo: GitHubRepository}>({repo: "content"});

export const FileItem: FunctionComponent<FileItemProps> = (props) => {
    const {onClick: innerClick, entry, className, ...rest} = props;
    const {setSelection, selectionPath} = useContext(FilesContext);
    const isSelected = selectionPath === entry.path;
    const {path} = entry;
    const isDir = entry.type === "dir";
    const onClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!isSelected) {
            setSelection?.({path, isDir});
        }
        if (innerClick) {
            innerClick(isSelected);
        }
    };
    return <ListGroupItem
        action
        id={pathToId(path)}
        tag="button"
        className={`${className ?? ""} ${styles.fileBrowserItem} ${isSelected ? styles.fileBrowserItemSelected : ""}`}
        onClick={onClick}
        {...rest}
    />;
};

function isOnPath(selectionPath: string | undefined, at: string) {
    return at === "" || (!!selectionPath && `${selectionPath}/`.substring(0, at.length + 1) === `${at}/`);
}

export function FilesList({open, error, data, menuRef, refreshParent}: {open: boolean | null, error: any; data: any; menuRef: MutableRefObject<PopupMenuRef | null>; refreshParent?: () => void}) {
    if (!open) return null;
    if (error) return <div className={styles.fileBrowserList}><em>Error loading data, {error}</em></div>;
    if (!data) return <div className={styles.fileBrowserList}><Spinner size="sm" /> Loading...</div>;
    return <ListGroup flush className={styles.fileBrowserList}>
        {data
            .sort((a: Entry, b: Entry) => a.type === b.type ? 0 : a.type === "dir" ? -1 : 1)
            .map((entry: Entry) => {
                switch (entry.type) {
                    case "dir":
                        return <Files key={entry.name} entry={entry} menuRef={menuRef}/>;
                    case "file":
                        // eslint-disable-next-line no-case-declarations
                        const fileOnContextMenu = (event: React.MouseEvent) => {
                            menuRef.current?.open(event, {...entry, refresh: refreshParent});
                            event.stopPropagation();
                            event.preventDefault();
                        };
                        return <FileItem key={entry.name} entry={entry} onContextMenu={fileOnContextMenu}>
                            {entry.name}
                        </FileItem>;
                    default:
                        return null;
                }
            })}
    </ListGroup>;
}

export function Files({entry, menuRef}: FilesProps) {
    const appContext = useContext(AppContext);
    const {selectionPath, repo} = useContext(FilesContext);

    const at = entry?.path ?? "";
    const [open, setOpen] = useState<boolean>(false);
    useEffect(() => {
        if (isOnPath(selectionPath, at)) {
            setOpen(true);
        }
    }, [selectionPath]);

    const {data, error, mutate} = useGithubContents(appContext, open && at, repo);
    const refresh = open ? mutate : undefined;

    const onContextMenu = (entry: Entry) => (event: React.MouseEvent) => {
        menuRef.current?.open(event, {...entry, refresh});
        event.stopPropagation();
        event.preventDefault();
    };

    const onClick = (isSelected: boolean) => {
        if (open) {
            if (isSelected) {
                setOpen(false);
            }
        } else {
            setOpen(true);
        }
    };

    return <>
        {entry && <FileItem className={open ? styles.fileBrowserOpenFolder : styles.fileBrowserClosedFolder}
            entry={entry} onClick={onClick} onContextMenu={onContextMenu(entry)}
        >
            {entry.name}
        </FileItem>}
        <FilesList data={data} menuRef={menuRef} error={error} open={open} refreshParent={refresh} />
    </>;
}

export type Selection = {
    path: string;
    isDir: boolean;
    forceRefresh?: boolean;
} | null;
export type SelectedContext = {
    getSelection: () => Selection;
    setSelection: (selection: Selection) => void;
}
export const defaultSelectedContext: SelectedContext = {getSelection: () => null, setSelection: () => {
    throw new Error("setSelected called outside of Provider");
}};

export function FileBrowser() {
    const menuRef = useRef<PopupMenuRef>(null);
    const appContext = useContext(AppContext);
    const selection = appContext.selection.getSelection();
    return <div className={styles.fileBrowser}>
        <FilesContext.Provider value={{selectionPath: selection?.path, setSelection: appContext.selection.setSelection, repo: "content"}}>
            <Files menuRef={menuRef} />
            <PopupMenu menuRef={menuRef} />
        </FilesContext.Provider>
    </div>;
}
