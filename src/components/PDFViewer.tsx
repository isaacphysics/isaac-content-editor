import React, {useContext, useEffect, useState} from 'react';
import {Alert, Button, ButtonGroup, Container, Input, Spinner} from "reactstrap";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

import { AppContext } from "../App";
import { useGithubContents } from "../services/github";
import { TopMenu } from "./TopMenu";
import { PDF_FILE_HEADER } from "../utils/base64";

import styles from "../styles/editor.module.css";

export function PDFViewer() {
    const appContext = useContext(AppContext);

    const selection = appContext.selection.getSelection();
    const path = selection?.path;
    const {data, error} = useGithubContents(appContext, path);

    const [invalid, setInvalid] = useState(false);

    // PDF navigation
    const [loaded, setLoaded] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [pendingPageNumber, setPendingPageNumber] = useState(1);
    const [editingPageNum, setEditingPageNum] = useState(false);

    useEffect(() => {
        if (data?.content && !data.content.match(RegExp(`^${PDF_FILE_HEADER}`))) {
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
            <Alert color="warning">This content does not appear to be a PDF.</Alert>
        </div>;
    }

    function onDocumentLoadSuccess({ numPages }: {numPages: number}) {
        setNumPages(numPages);
        setLoaded(true);
    }

    function updatePageNumber() {
        setEditingPageNum(false);
        setPageNumber(Math.min(Math.max(1, pendingPageNumber), numPages));
    }

    return <div className={styles.editorWrapper}>
        <TopMenu />
        {loaded && <div className={styles.pdfNavigation}>
            <ButtonGroup className={styles.pdfNavButtons}>
                <Button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(p - 1, 1))}>&lt;</Button>
                <Button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}>&gt;</Button>
            </ButtonGroup>
            <h5>Page {editingPageNum
                ? <>
                    <Input
                        className={"d-inline-block"}
                        value={pendingPageNumber}
                        onChange={e => setPendingPageNumber(parseInt(e.target.value) || pageNumber)}
                        onKeyDown={e => e.key === "Enter" && updatePageNumber()}
                    />
                    <Button onClick={updatePageNumber} className={"d-inline-block ml-2"}>Go</Button>
                </>
                : <button onClick={() => {setEditingPageNum(true); setPendingPageNumber(pageNumber);}}>{pageNumber}/{numPages}</button>
            }</h5>
        </div>}

        <Container fluid className={styles.pdfContainer}>
            <Document renderMode={"svg"} className={styles.pdfDocument} file={`data:pdf;base64,${appContext.editor.getCurrentDocAsString()}`} onLoadSuccess={onDocumentLoadSuccess}>
                <Page renderAnnotationLayer={false} renderTextLayer={false} className={styles.pdfPage} pageNumber={pageNumber} />
            </Document>
        </Container>
    </div>;
}
