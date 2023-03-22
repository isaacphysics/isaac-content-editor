import React, {useContext, useEffect, useState} from 'react';
import {Alert, Container, Spinner} from "reactstrap";

import { AppContext } from "../App";
import { useGithubContents } from "../services/github";

import { TopMenu } from "./TopMenu";

import styles from "../styles/editor.module.css";

export function ImageViewer() {
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const {data, error} = useGithubContents(appContext, path);

    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        if (!data || !data.download_url) {
            setInvalid(true);
        } else {
            setInvalid(false);
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
            <Alert color="warning">This content does not appear to be an image.</Alert>
        </div>
    }

    return <div className={styles.editorWrapper}>
        <TopMenu />
        <Container>
            <img className={styles.centerImage} src={data.download_url} alt={path} />
        </Container>
    </div>;
}
