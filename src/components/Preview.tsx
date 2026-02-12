import React, {ReactElement, useContext, useEffect, useRef, useState} from "react";
import {Spinner} from "reactstrap";

import {AppContext} from "../App";
import {Content, Figure} from "../isaac-data-types";
import {getConfig} from "../services/config";

import styles from "../styles/editor.module.css";
import { FigurePresenter } from "./semantic/presenters/FigurePresenter";

export type PreviewMode = "modal" | "panel";

export const defaultPreview = {
    open: false,
    toggle: (() => {
        throw new Error("preview.toggle called outside AppContext");
    }) as () => void,
    mode: "modal" as PreviewMode,
    toggleMode: (() => {
        throw new Error("preview.toggleMode called outside AppContext");
    }) as () => void,
};

export function Preview() {
    const appContext = useContext(AppContext);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [ready, setReady] = useState(false);
    const [encodedFigureRegistry, setEncodedFigureRegistry] = useState<Record<string, string>>({});

    useEffect(() => {
        function messageHandler(event: MessageEvent) {
            if ("ready" in event.data) {
                setReady(true);
                done();
            }
        }
        function done() {
            window.removeEventListener("message", messageHandler);
        }
        window.addEventListener("message", messageHandler);
        return done;
    }, []);

    let doc: Content|null = null;
    try {
        doc = appContext.editor.getCurrentDoc();
    } catch (_e) {
        // No doc currently
    }

    const {previewServer} = getConfig();

    useEffect(() => {
        if (ready) {
            const previewURL = new URL(previewServer);
            iframeRef.current?.contentWindow?.postMessage({doc: doc && replaceFigures(doc, encodedFigureRegistry)}, previewURL.origin);
        }
    }, [doc, ready, previewServer, encodedFigureRegistry]);

    return <div className={styles.previewWrapper}>
        {doc && <div style={{display: "none"}}>
            {loadAllFigures(doc, setEncodedFigureRegistry)}
        </div>}
        
        <div className="m-2">
            Preview for: <span className="fw-bold">{doc?.title ?? "undefined"}</span>
        </div>
        <iframe ref={iframeRef} className={`${styles.previewIframe} ${!ready ? styles.displayNone : ""}`} title="Isaac Preview" src={previewServer} />
        {!ready && <div className={styles.centered}><Spinner size="lg" /></div>}
    </div>;
}

type RegistrySetter = React.Dispatch<React.SetStateAction<Record<string, string>>>
const loadAllFigures = (doc: Content, setEncodedFigureRegistry: RegistrySetter): ReactElement[] => {
    const results: ReactElement[] = [];
    
    if ('children' in doc && Array.isArray(doc.children)) {
        results.push(...doc.children.flatMap(d => loadAllFigures(d, setEncodedFigureRegistry)));
    }
    
    if (isFigure(doc) && doc.src) {
        results.push(<FigurePresenter key={doc.src} doc={doc} update={() => {}} setEncodedFigure={(k, data) => {
            setEncodedFigureRegistry(prev => ({ ...prev, [k]: data }));
        }}/>);
    }
    
    return results;
};

const replaceFigures = (doc: Content, encodedFigureRegistry: Record<string, string>): Content => {
    const newDoc = {...doc};
    
    if ('children' in doc && Array.isArray(doc.children)) {
        newDoc.children = doc.children.map(d => replaceFigures(d, encodedFigureRegistry));
    }

    if (isFigure(doc) && isFigure(newDoc) && doc.src) {
        newDoc.src = encodedFigureRegistry[doc.src];
    }

    return newDoc;
};

const isFigure = (doc: Content): doc is Figure => {
    return doc.type === 'figure';
};
