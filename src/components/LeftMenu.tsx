import React, {useContext, useLayoutEffect} from "react";

import {AppContext} from "../App";
import {FileBrowser, pathToId} from "./FileBrowser";

import styles from "../styles/editor.module.css";
import {dirname} from "../utils/strings";
import {useGithubContents} from "../services/github";
import {useFixedRef} from "../utils/hooks";
import {useNavigate} from "react-router-dom";

function scrollPathIntoView(path: string, snap?: boolean) {
    const item = document.getElementById(pathToId(path));
    item?.scrollIntoView({block: "start", inline: "start", behavior: snap ? "auto" : "smooth"});
    return !!item;
}

export function LeftMenu() {
    const appContext = useContext(AppContext);
    const navigate = useNavigate();

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const pathRef = useFixedRef(path);

    const {error} = useGithubContents(appContext, path);
    const errorRef = useFixedRef(error);

    // Run this on first load only
    useLayoutEffect(() => {
        function tryAgain() {
            if (path) {
                if (!scrollPathIntoView(path, true)) {
                    if (errorRef.current) {
                        // Give up if there is an issue fetching path.
                        return;
                    }
                    if (path === pathRef.current) {
                        // Retry whilst we are still at this path.
                        setTimeout(tryAgain, 250);
                    }
                }
            }
        }
        tryAgain();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className={styles.leftMenuWrapper}>
        <header className={styles.leftMenuHeader}>
            <button className={styles.iconButton} onClick={async () => {
                if (window.confirm("Are you sure you want to logout?")) {
                    await navigate("/logout");
                }
            }}>
                Logout
            </button>
            <div className={styles.flexFill} />
            <button className={styles.iconButton} onClick={() => {
                const basePath = selection?.isDir ? selection?.path : dirname(selection?.path);
                if (basePath) {
                    appContext.dispatch({type: "new", path: basePath});
                }
            }}>
                New...
            </button>
            <button className={`${styles.iconButton} ${styles.sm}`} onClick={() => {
                if (selection) {
                    const path = selection.path;
                    scrollPathIntoView(path);
                }
            }}>🔍</button>
        </header>
        <FileBrowser />
        <footer className={styles.leftMenuHeader}>
            <button className={styles.iconButton} onClick={appContext.cdn.toggle}>
                Upload to CDN
            </button>
        </footer>
    </div>;
}
