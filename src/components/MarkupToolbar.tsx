import React, {RefObject, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {ReactCodeMirrorRef} from "@uiw/react-codemirror";
import {PopupGlossaryTermSelect} from "./popups/PopupGlossaryTermSelect";
import {PopupDropZoneInsert} from "./popups/PopupDropZoneInsert";
import styles from "../styles/editor.module.css";
import {
    encodingSpecific,
    isMarkupEncoding,
    makeBold,
    makeCode,
    makeItalic,
    makeStrikethrough
} from "../utils/codeMirrorExtensions";
import {DropZoneQuestionContext} from "./semantic/presenters/ItemQuestionPresenter";
import { InlineQuestionContext } from "./semantic/presenters/questionPresenters";
import { PopupInlineQuestionInsert } from "./popups/PopupInlineQuestionInsert";
import { PopupTableClass } from "./popups/PopupTableClass";

export const MarkupToolbar = ({set, cancel, codemirror, encoding, value}: { set: () => void, cancel: () => void, codemirror?: RefObject<ReactCodeMirrorRef>, encoding: string | undefined, value?: string }) => {
    const {isClozeQuestion} = useContext(DropZoneQuestionContext);
    const inlineContext = useContext(InlineQuestionContext);

    const [wide, setWide] = useState(true);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // TODO should be replaced by `useDeviceSize` (from isaac-react-app)
    const updateIsWide = useCallback(() => {
        const MIN_WIDTH = 500;
        const width = toolbarRef.current?.clientWidth;
        setWide(!width || width >= MIN_WIDTH);
    }, []);

    useLayoutEffect(() => {
        updateIsWide();
    }, []);

    useEffect(() => {
        if (!toolbarRef.current) return;
        const resizeObserver = new ResizeObserver(updateIsWide);
        resizeObserver.observe(toolbarRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return <div ref={toolbarRef} className={"d-flex w-100 bg-light border-bottom p-1 " + styles.cmMenuBar}>
        <button className={styles.cmPanelButton} title={"Set (Mod-Shift-Enter)"}
            aria-label={"Save changes to this markup block (shortcut is Mod-Shift-Enter)"}
            onClick={set}>
            💾{wide && " Set"}
        </button>
        <button className={styles.cmPanelButton} title={"Cancel (Esc)"}
            aria-label={"Cancel changes to this markup block (shortcut is Esc)"}
            onClick={cancel}>
            ❌{wide && " Cancel"}
        </button>
        {isMarkupEncoding(encoding) && codemirror && <>
            <button className={"ml-auto " + styles.cmPanelButton} title={"Bold (Ctrl-B)"}
                aria-label={"Make highlighted text bold (shortcut is Ctrl-B)"}
                onClick={() => makeBold(encoding)(codemirror.current?.view)}>
                <b>B</b>
            </button>
            <button className={styles.cmPanelButton} title={"Italic (Ctrl-Shift-I)"}
                aria-label={"Make highlighted text italic (shortcut is Ctrl-Shift-I)"}
                onClick={() => makeItalic(encoding)(codemirror.current?.view)}>
                <i>I</i>
            </button>
            <button className={styles.cmPanelButton} title={"Strikethrough (Ctrl-Shift-S)"}
                aria-label={"Strike-through highlighted text (shortcut is Ctrl-Shift-S)"}
                onClick={() => makeStrikethrough(encoding)(codemirror.current?.view)}>
                <s className={"d-inline"}>S</s>
            </button>
            <button className={styles.cmPanelButton} title={"Code (Ctrl-Shift-C)"}
                aria-label={"Format highlighted text as code (shortcut is Ctrl-Shift-C)"}
                onClick={() => makeCode(encoding)(codemirror.current?.view)}>
                <pre className={"d-inline"}>&lt;&gt;</pre>
            </button>
            {encodingSpecific(
                <>
                    {isClozeQuestion && <PopupDropZoneInsert wide={wide} codemirror={codemirror}/>}
                    {inlineContext.isInlineQuestion && <PopupInlineQuestionInsert wide={wide} codemirror={codemirror}/>}
                    {value?.includes("<table") && <PopupTableClass wide={wide} codemirror={codemirror}/>}
                    <PopupGlossaryTermSelect wide={wide} codemirror={codemirror}/>
                </>,
                null,
                encoding
            )}
        </>}
    </div>;
};
