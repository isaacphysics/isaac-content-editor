import React, {RefObject, useCallback, useContext, useRef, useState} from "react";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";
import {Alert, Button, Container, Input, InputGroup, Label} from "reactstrap";
import {ReactCodeMirrorRef} from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";
import { DropZoneQuestionContext } from "../semantic/presenters/ItemQuestionPresenter";

export const PopupDropZoneInsert = ({wide, codemirror}: { wide?: boolean, codemirror: RefObject<ReactCodeMirrorRef> }) => {
    const popupRef = useRef<PopupRef>(null);
    const {isDndQuestion, isClozeQuestion, dropZoneIds} = useContext(DropZoneQuestionContext);

    const updatedDropZoneIds = useRef<Set<string>>(dropZoneIds);

    const [width, setWidth] = useState<string>();
    const [height, setHeight] = useState<string>();
    const [index, setIndex] = useState<string>();
    const [inLatex, setInLatex] = useState<boolean>(false);

    const nextDropZoneId = useCallback(() => {
        let nextId = "A1";
        while (updatedDropZoneIds.current?.has(nextId)) {
            const number = parseInt(nextId.substring(1));
            nextId = `A${number + 1}`;
        }
        return nextId;
    }, [updatedDropZoneIds]);
    const [id, setId] = useState<string>(nextDropZoneId());

    const generateAndInsertDropZone = useCallback(() => {
        const dropZoneSyntax = `[drop-zone${id ? `:${id}` : ""}${(width || height || index) ? "|" : ""}${index ? `i-${index}` : ""}${width ? `w-${width}` : ""}${height ? `h-${height}` : ""}]`;
        if (id) {
            if (!updatedDropZoneIds.current) {
                updatedDropZoneIds.current = new Set<string>();
            }
            updatedDropZoneIds.current.add(id);
        }
        codemirror.current?.view?.dispatch(
            codemirror.current?.view?.state.replaceSelection(inLatex ? `\\text{${dropZoneSyntax}}` : dropZoneSyntax)
        );
    }, [width, height, index, id, inLatex, codemirror]);

    const widthInvalid = width && (Number.isNaN(Number(width)) || Number(width) < 0);
    const heightInvalid = height && (Number.isNaN(Number(height)) || Number(height) < 0);
    const indexInvalid = index && (!Number.isInteger(Number(index)) || Number(index) < 0);
    const idInvalid = isDndQuestion && !id;
    const valid = !idInvalid && !widthInvalid && !heightInvalid && !indexInvalid;

    return <>
        <button className={styles.cmPanelButton} title={"Insert cloze drop-zone"} onClick={(event) => {
            popupRef.current?.open(event);
        }}>{wide ? `Add ${isDndQuestion ? "DnD" : "cloze"} drop-zone` : "➕ drop-zone"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                <Label for={"drop-zone-width"}>Width:</Label>
                <Input id={"drop-zone-width"} placeholder={"Default"} onChange={(e) => setWidth(e.target.value)} />
                {widthInvalid && <Alert className="my-1" color="warning">Width must be a positive number</Alert>}
                <Label className="mt-2" for={"drop-zone-height"}>Height:</Label>
                <Input id={"drop-zone-height"} placeholder={"Default"} onChange={(e) => setHeight(e.target.value)} />
                {heightInvalid && <Alert className="my-1" color="warning">Height must be a positive number</Alert>}
                <hr/>
                {isClozeQuestion && <>
                    <Label for={"drop-zone-index"}>Index override:</Label>
                    <Input id={"drop-zone-index"} placeholder={"None"} onChange={(e) => setIndex(e.target.value)} />
                    {indexInvalid && <Alert className="my-1" color="warning">Index must be a positive integer</Alert>}
                    <hr/>
                </>}
                {isDndQuestion && <>
                    <Label for={"drop-zone-id"}>Drop-zone ID:</Label>
                    <Input id={"drop-zone-id"} defaultValue={nextDropZoneId()} onChange={(e) => setId(e.target.value)} />
                    {idInvalid && <Alert className="my-1" color="danger">Drop zone missing ID!</Alert>}
                    <hr/>
                </>}
                <InputGroup className={"ps-4"}>
                    <Label for={"drop-zone-in-latex"}>Inside LaTeX?:</Label>
                    <Input type={"checkbox"} id={"drop-zone-in-latex"} onChange={() => setInLatex(b => !b)} checked={inLatex} />
                </InputGroup>
                <hr/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!valid} onClick={() => {
                        generateAndInsertDropZone();
                        setWidth(undefined);
                        setHeight(undefined);
                        setIndex(undefined);
                        setId(nextDropZoneId());
                        setInLatex(false);
                        close?.();
                    }}>
                        Generate drop zone
                    </Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>;
};
