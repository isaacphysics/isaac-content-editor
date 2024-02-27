import React, { ComponentProps, FunctionComponent, MutableRefObject, useContext, useRef, useState } from "react";
import { ListGroup, ListGroupItem, Spinner } from "reactstrap";

import { AppContext } from "../App";
import styles from "../styles/editor.module.css";
import { PopupMenu, PopupMenuRef } from "./popups/PopupMenu";
import { useGithubContents } from "../services/github";

export type Entry =
  | {
      type: "file";
      name: string;
      path: string;
      sha: string;
    }
  | {
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

const FileItem: FunctionComponent<FileItemProps> = (props) => {
  const { onClick: innerClick, entry, className, ...rest } = props;
  const selectionContext = useContext(AppContext).selection;
  const selection = selectionContext.getSelection();
  const isSelected = selection?.path === entry.path;

  const { path } = entry;
  const isDir = entry.type === "dir";

  const onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectionContext.setSelection({ path, isDir });
    }
    if (innerClick) {
      innerClick(isSelected);
    }
  };
  return (
    <ListGroupItem
      action
      id={pathToId(path)}
      tag="button"
      className={`${className ?? ""} ${styles.fileBrowserItem} ${isSelected ? styles.fileBrowserItemSelected : ""}`}
      onClick={onClick}
      {...rest}
    />
  );
};

function isOnSelectionPath(selection: Selection, at: string) {
  return at === "" || (selection && `${selection.path}/`.substring(0, at.length + 1) === `${at}/`);
}

function FilesList({
  open,
  error,
  data,
  menuRef,
}: {
  open: boolean | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  menuRef: MutableRefObject<PopupMenuRef | null>;
}) {
  if (!open) return null;
  if (error)
    return (
      <div className={styles.fileBrowserList}>
        <em>Error loading data, {error}</em>
      </div>
    );
  if (!data)
    return (
      <div className={styles.fileBrowserList}>
        <Spinner size="sm" /> Loading...
      </div>
    );
  return (
    <ListGroup flush className={styles.fileBrowserList}>
      {data
        .sort((a: Entry, b: Entry) => (a.type === b.type ? 0 : a.type === "dir" ? -1 : 1))
        .map((entry: Entry) => {
          switch (entry.type) {
            case "dir":
              return <Files key={entry.name} entry={entry} menuRef={menuRef} />;
            case "file":
              // eslint-disable-next-line no-case-declarations
              const fileOnContextMenu = (event: React.MouseEvent) => {
                menuRef.current?.open(event, entry);
                event.stopPropagation();
                event.preventDefault();
              };
              return (
                <FileItem key={entry.name} entry={entry} onContextMenu={fileOnContextMenu}>
                  {entry.name}
                </FileItem>
              );
            default:
              return null;
          }
        })}
    </ListGroup>
  );
}

function Files({ entry, menuRef }: FilesProps) {
  const appContext = useContext(AppContext);
  const selection = appContext.selection.getSelection();
  const at = entry?.path ?? "";
  const [open, setOpen] = useState(isOnSelectionPath(selection, at));

  const { data, error, mutate } = useGithubContents(appContext, open && at);

  const onContextMenu = (entry: Entry) => (event: React.MouseEvent) => {
    menuRef.current?.open(event, { ...entry, refresh: open ? mutate : undefined });
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

  return (
    <>
      {entry && (
        <FileItem
          className={open ? styles.fileBrowserOpenFolder : styles.fileBrowserClosedFolder}
          entry={entry}
          onClick={onClick}
          onContextMenu={onContextMenu(entry)}
        >
          {entry.name}
        </FileItem>
      )}
      <FilesList data={data} menuRef={menuRef} error={error} open={open} />
    </>
  );
}

export type Selection = {
  path: string;
  isDir: boolean;
  forceRefresh?: boolean;
} | null;
export type SelectedContext = {
  getSelection: () => Selection;
  setSelection: (selection: Selection) => void;
};
export const defaultSelectedContext: SelectedContext = {
  getSelection: () => null,
  setSelection: () => {
    throw new Error("setSelected called outside of Provider");
  },
};

export function FileBrowser() {
  const menuRef = useRef<PopupMenuRef>(null);
  return (
    <div className={styles.fileBrowser}>
      <Files menuRef={menuRef} />
      <PopupMenu menuRef={menuRef} />
    </div>
  );
}
