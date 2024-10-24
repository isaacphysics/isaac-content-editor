import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { RefObject, useCallback, useContext, useRef, useState } from "react";
import React from "react";
import styles from "../../styles/editor.module.css";
import { Popup, PopupCloseContext, PopupRef } from "./Popup";
import { Button, Container, Input, Label } from "reactstrap";
import { InlineQuestionContext } from "../semantic/presenters/questionPresenters";

export const PopupInlineQuestionInsert = ({wide, codemirror}: { wide?: boolean, codemirror: RefObject<ReactCodeMirrorRef> }) => {
    const popupRef = useRef<PopupRef>(null);
    const inlineContext = useContext(InlineQuestionContext);

    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [id, setID] = useState<string>();
    const [valid, setValid] = useState<boolean>(true);
    const [classes, setClasses] = useState<string>();
    const [mode, setMode] = useState<"classes" | "dimensions">("classes");

    const generateAndInsertInlinePart = useCallback(() => {
        const partId = id ? id : (inlineContext.numParts ?? 0) + 1;
        const inlinePartSyntax = mode === "classes" ? 
            `[inline-question:${partId}${classes ? " class=\"" + classes + "\"" : ""}]` : 
            `[inline-question:${partId}${(width || height) ? "|" : ""}${width ? `w-${width}` : ""}${height ? `h-${height}` : ""}]`;
        codemirror.current?.view?.dispatch(
            codemirror.current?.view?.state.replaceSelection(inlinePartSyntax)
        );
        inlineContext.addPart?.("" + partId);
    }, [id, inlineContext, mode, classes, width, height, codemirror]);

    const ifValidNumericalInputThen = (f: (n: number | undefined) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const n = parseInt(e.target.value);
        if (!isNaN(n) || !e.target.value || e.target.value === "") {
            setValid(true);
            f(n);
        } else {
            setValid(false);
        }
    }

    return <>
        <button className={styles.cmPanelButton} title={"Insert inline question part"} onClick={(event) => {
            popupRef.current?.open(event);
        }}>{wide ? "Add inline question part" : "➕ inline part"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                <Label for={"inline-part-index"}>Part ID</Label>
                <Input id={"inline-part-index"} placeholder={"Default"} onChange={(e) => setID(e.target.value)} />
                <hr className="mb-1"/>
                {mode === "classes" ? <>
                    <Label for={"inline-part-classes"}>Classes:</Label>
                    <Input id={"inline-part-classes"} placeholder={"e.g. wf-8"} onChange={(e) => setClasses(e.target.value)}/>
                </> : <>
                    <Label for={"inline-part-width"}>Width (px):</Label>
                    <Input id={"inline-part-width"} placeholder={"Default (100)"} onChange={ifValidNumericalInputThen(setWidth)}/>
                    <hr/>
                    <Label for={"inline-part-height"}>Height (px):</Label>
                    <Input id={"inline-part-height"} placeholder={"Default (27)"} onChange={ifValidNumericalInputThen(setHeight)}/>
                </>}
                <hr className="my-1"/>
                <div className="float-right mb-2">
                    <a className="mr-1" target="_blank" rel="noreferrer" href="https://github.com/isaacphysics/rutherford-content/wiki/Isaac-Content-Editor#inline-regions--inline-questions">Help</a>
                    ⋅
                    <Button 
                        color="link"
                        className="p-0 ml-1 mb-1 text-muted"
                        onClick={() => setMode(mode === "classes" ? "dimensions" : "classes")}
                        >
                        Switch to {mode === "classes" ? "dimensions" : "classes"}
                    </Button>
                </div>
                <br/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!valid} onClick={() => {
                        generateAndInsertInlinePart();
                        setWidth(undefined);
                        setHeight(undefined);
                        setClasses(undefined);
                        setID(undefined);
                        close?.();
                    }}>Insert</Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>
}
