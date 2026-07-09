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

    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [index, setIndex] = useState<number>();
    const [valid, setValid] = useState<boolean>(true);
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

    const ifValidNumericalInputThen = (f: (n: number | undefined) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const n = parseInt(e.target.value);
        if (!isNaN(n) || !e.target.value || e.target.value === "") {
            setValid(true);
            f(n);
        } else {
            setValid(false);
        }
    };

    return <>
        <button className={styles.cmPanelButton} title={"Insert cloze drop-zone"} onClick={(event) => {
            popupRef.current?.open(event);
        }}>{wide ? `Add ${isDndQuestion ? "DnD" : "cloze"} drop-zone` : "➕ drop-zone"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                <Label for={"drop-zone-width"}>Width:</Label>
                <Input id={"drop-zone-width"} placeholder={"Default"} onChange={ifValidNumericalInputThen(setWidth)}/>
                <Label className="mt-2" for={"drop-zone-height"}>Height:</Label>
                <Input id={"drop-zone-height"} placeholder={"Default"} onChange={ifValidNumericalInputThen(setHeight)} />
                <hr/>
                {isClozeQuestion && <>
                    <Label for={"drop-zone-index"}>Index override:</Label>
                    <Input id={"drop-zone-index"} placeholder={"None"} onChange={ifValidNumericalInputThen(setIndex)} />
                    <hr/>
                </>}
                {isDndQuestion && <>
                    <Label for={"drop-zone-id"}>Drop-zone ID:</Label>
                    <Input id={"drop-zone-id"} defaultValue={nextDropZoneId()} onChange={(e) => {setId(e.target.value); setValid(!!e.target.value)}} />
                    {!id && <Alert className="mt-1" color="danger">Missing ID field</Alert>}
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
