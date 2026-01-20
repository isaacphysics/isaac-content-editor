import React, {useContext, useEffect, useState} from 'react';
import {Alert, Container, Spinner} from "reactstrap";

import { AppContext } from "../App";
import { useGithubContents } from "../services/github";
import { IMG_FILE_HEADERS } from "../utils/base64";
import { TopMenu } from "./TopMenu";

import styles from "../styles/editor.module.css";

export function ImageViewer() {
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const {data, error} = useGithubContents(appContext, path);

    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        if (data?.content && !data.content.match(RegExp(`^(${Object.values(IMG_FILE_HEADERS).join("|")})`))) {
            setInvalid(false);
            appContext.editor.loadNewDoc(data.content);
        } else {
            setInvalid(true);
        }
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
            <Alert color="warning">This content does not appear to be an image (PDF, JPEG or GIF).</Alert>
        </div>;
    }

    return <div className={styles.editorWrapper}>
        <TopMenu />
        <Container>
            <img className={styles.centerImage} src={`data:image;base64,${appContext.editor.getCurrentDocAsString()}`} alt={path} />
        </Container>
    </div>;
}
