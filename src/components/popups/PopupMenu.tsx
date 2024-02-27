import React, { MutableRefObject, useContext, useImperativeHandle, useRef, useState } from "react";

import { AppContext } from "../../App";

import { Entry } from "../FileBrowser";

import styles from "../../styles/editor.module.css";
import { githubReplaceWithConfig } from "../../services/github";
import { Popup, PopupCloseContext, PopupRef } from "./Popup";

type PopupEntry = Entry & {
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
    };

function MenuItem({ onClick, href, text }: MenuItemProps) {
  const close = useContext(PopupCloseContext);
  return (
    <li>
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            window.open(href, "_blank");
          }
          close?.();
        }}
      >
        {text}
      </button>
    </li>
  );
}

export function PopupMenu({ menuRef }: { menuRef: MutableRefObject<PopupMenuRef | null> }) {
  const [item, setItem] = useState<PopupEntry>(undefined as unknown as PopupEntry);
  const appContext = useContext(AppContext);

  const popupRef = useRef<PopupRef>(null);

  const isCurrentFile = item?.path === appContext.selection.getSelection()?.path;

  useImperativeHandle(
    menuRef,
    () => ({
      open: (event, item) => {
        setItem(item);
        popupRef.current?.open(event);
      },
    }),
    [setItem],
  );

  return (
    <Popup popUpRef={popupRef}>
      <ul className={styles.leftMenuPopupMenu}>
        {item?.type === "dir" && (
          <MenuItem
            onClick={() =>
              appContext.dispatch({
                type: "new",
                path: item.path,
              })
            }
            text="New..."
          />
        )}
        <MenuItem
          onClick={() =>
            appContext.dispatch({
              type: "openInNewTab",
              path: item.path,
            })
          }
          text="Open in new tab"
        />
        {item?.type === "dir" && item.refresh && (
          <>
            <hr />
            <MenuItem onClick={() => item.refresh?.()} text="Refresh" />
          </>
        )}
        {item?.type === "file" && isCurrentFile && (
          <MenuItem
            onClick={() =>
              appContext.dispatch({
                type: "rename",
                path: item.path,
                name: item.name,
              })
            }
            text="Rename..."
          />
        )}
        {item?.type === "file" && isCurrentFile && (
          <MenuItem
            onClick={() =>
              appContext.dispatch({
                type: "saveAs",
                path: item.path,
                name: item.name,
              })
            }
            text="Save as..."
          />
        )}
        {item?.type === "file" && (
          <MenuItem
            onClick={() =>
              appContext.dispatch({
                type: "delete",
                path: item.path,
                name: item.name,
                sha: item.sha,
              })
            }
            text="Delete"
          />
        )}
        {item?.type === "file" && <hr />}
        {item?.type === "file" && (
          <MenuItem
            href={`${githubReplaceWithConfig("https://github.com/$OWNER/$REPO/blob")}/${appContext.github.branch}/${item.path}`}
            text="View on github"
          />
        )}
        {item?.type === "file" && (
          <MenuItem
            href={`${githubReplaceWithConfig("https://github.com/$OWNER/$REPO/issues/new")}?body=${encodeURIComponent(
              `Issue found in ${item.path} by ${appContext.github.user.login}.\n\n<Describe issue here>`,
            )}`}
            text="Report issue on github"
          />
        )}
      </ul>
    </Popup>
  );
}
