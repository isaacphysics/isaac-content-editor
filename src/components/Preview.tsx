import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Spinner} from "reactstrap";

import {AppContext} from "../App";
import {Content, Media} from "../isaac-data-types";
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

    const inlineableMedia = useMemo(() => findInlineableMedia(doc), [doc]);

    // the key updates (resetting the component) if the doc changes or if any inlineable media updates (in either case, hook count can change).
    const key = useMemo(() => `${doc?.id ?? "unknown"}-${inlineableMedia.map(m => m.src).join("-")}`, [doc, inlineableMedia]);

    return <PreviewRenderer key={key} doc={doc} inlineableMedia={inlineableMedia} previewServer={previewServer} />;
}

interface PreviewRendererProps {
    doc: Content | null;
    inlineableMedia: Media[];
    previewServer: string;
}

const PreviewRenderer = ({doc, inlineableMedia, previewServer}: PreviewRendererProps) => {
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


    const mediaSrcToDataMap = inlineableMedia.reduce((prev, media) => ({
        ...prev, 
        // while this calls the useLoadMedia hook multiple times, it always calls it in the same order, the same number of times – so is fine.
        // see frontend portals for a similar pattern.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        [media.src as string]: useLoadMedia(media) ?? ""
    }), {} as Record<string, string>);

    const mediaCorrectedDoc = useMemo(() => replaceMedia(doc as Content, mediaSrcToDataMap), [doc, mediaSrcToDataMap]);

    useEffect(() => {
        if (ready) {
            const previewURL = new URL(previewServer);
            iframeRef.current?.contentWindow?.postMessage({doc: mediaCorrectedDoc}, previewURL.origin);
        }
    }, [mediaCorrectedDoc, ready, previewServer]);

    return <div className={styles.previewWrapper}>    
        <div className="m-2">
            Preview for: <span className="fw-bold">{mediaCorrectedDoc?.title ?? "undefined"}</span>
        </div>
        <iframe ref={iframeRef} className={`${styles.previewIframe} ${!ready ? styles.displayNone : ""}`} title="Isaac Preview" src={previewServer} />
        {!ready && <div className={styles.centered}><Spinner size="lg" /></div>}
    </div>;
};

const findInlineableMedia = (doc: Content | null): Media[] => {
    const results: Media[] = [];

    if (!doc) {
        return results;
    }

    if ('children' in doc && Array.isArray(doc.children)) {
        results.push(...doc.children.flatMap(findInlineableMedia));
    }
    
    if (isInlineableMedia(doc) && doc.src) {
        results.push(doc);
    }
    
    return results;
};

const replaceMedia = (doc: Content, mediaSrcToDataMap: Record<string, string>): Content => {
    const newDoc = {...doc};

    if ('children' in doc && Array.isArray(doc.children)) {
        newDoc.children = doc.children.map(d => replaceMedia(d, mediaSrcToDataMap));
    }

    if (isInlineableMedia(doc) && isInlineableMedia(newDoc) && doc.src && mediaSrcToDataMap[doc.src as string]) {
        newDoc.src = mediaSrcToDataMap[doc.src as string];
    }

    return newDoc;
};

const useLoadMedia = (doc: Media) => {
    const figureDataFromGithub = useGetContentMediaSrcDataFromGithub(doc);
    if (!figureDataFromGithub) return undefined;
    const src = getImageDataFromGithub({doc, data: figureDataFromGithub});
    return src;
};

const isInlineableMedia = (doc: Content): doc is Media => {
    return doc.type === 'image' || doc.type === 'figure';
};
