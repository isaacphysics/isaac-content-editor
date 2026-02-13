import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Spinner} from "reactstrap";

import {AppContext} from "../App";
import {Content, Figure} from "../isaac-data-types";
import {getConfig} from "../services/config";

import styles from "../styles/editor.module.css";
import { getImageDataFromGithub, useGetContentMediaSrcDataFromGithub } from "./semantic/presenters/FigurePresenter";

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
    const {previewServer} = getConfig();

    let doc: Content|null = null;
    try {
        doc = appContext.editor.getCurrentDoc();
    } catch (_e) {
        // No doc currently
    }

    return <PreviewRenderer key={doc?.id ?? doc?.title ?? "unknown"} doc={doc} previewServer={previewServer} />;
}

interface PreviewRendererProps {
    doc: Content | null;
    previewServer: string;
}

const PreviewRenderer = ({doc, previewServer}: PreviewRendererProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [ready, setReady] = useState(false);

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

    const figures = useMemo(() => findFigures(doc), [doc]);

    const figureSrcToDataMap = figures.reduce((prev, figure) => ({
        ...prev, 
        // while this calls the useLoadFigure hook multiple times, it always calls it in the same order, the same number of times – so is fine.
        // see frontend portals for a similar pattern.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        [figure.src as string]: useLoadFigure(figure) ?? ""
    }), {} as Record<string, string>);

    const figureCorrectedDoc = useMemo(() => replaceFigures(doc as Content, figureSrcToDataMap), [doc, figureSrcToDataMap]);

    useEffect(() => {
        if (ready) {
            const previewURL = new URL(previewServer);
            iframeRef.current?.contentWindow?.postMessage({doc: figureCorrectedDoc}, previewURL.origin);
        }
    }, [figureCorrectedDoc, ready, previewServer]);

    return <div className={styles.previewWrapper}>    
        <div className="m-2">
            Preview for: <span className="fw-bold">{figureCorrectedDoc?.title ?? "undefined"}</span>
        </div>
        <iframe ref={iframeRef} className={`${styles.previewIframe} ${!ready ? styles.displayNone : ""}`} title="Isaac Preview" src={previewServer} />
        {!ready && <div className={styles.centered}><Spinner size="lg" /></div>}
    </div>;
};

const findFigures = (doc: Content | null): Figure[] => {
    const results: Figure[] = [];

    if (!doc) {
        return results;
    }

    if ('children' in doc && Array.isArray(doc.children)) {
        results.push(...doc.children.flatMap(findFigures));
    }
    
    if (isFigure(doc) && doc.src) {
        results.push(doc);
    }
    
    return results;
};

const replaceFigures = (doc: Content, figureSrcToDataMap: Record<string, string>): Content => {
    const newDoc = {...doc};

    if ('children' in doc && Array.isArray(doc.children)) {
        newDoc.children = doc.children.map(d => replaceFigures(d, figureSrcToDataMap));
    }

    if (isFigure(doc) && isFigure(newDoc) && doc.src && figureSrcToDataMap[doc.src as string]) {
        newDoc.src = figureSrcToDataMap[doc.src as string];
    }

    return newDoc;
};

const useLoadFigure = (doc: Figure) => {
    const figureDataFromGithub = useGetContentMediaSrcDataFromGithub(doc);
    if (!figureDataFromGithub) return undefined;
    const src = getImageDataFromGithub({doc, data: figureDataFromGithub});
    return src;
};

const isFigure = (doc: Content): doc is Figure => {
    return doc.type === 'figure';
};
