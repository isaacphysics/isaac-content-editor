import React, {RefObject, useCallback, useRef, useState} from "react";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";
import {Button, Container, Input, InputGroup, Label} from "reactstrap";
import {ReactCodeMirrorRef} from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";

export const PopupDropZoneInsert = ({wide, codemirror}: { wide?: boolean, codemirror: RefObject<ReactCodeMirrorRef> }) => {
    const popupRef = useRef<PopupRef>(null);

    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [index, setIndex] = useState<number>();
    const [valid, setValid] = useState<boolean>(true);
    const [inLatex, setInLatex] = useState<boolean>(false);

    const generateAndInsertDropZone = useCallback(() => {
        const dropZoneSyntax = `[drop-zone${(width || height || index) ? "|" : ""}${index ? `i-${index}` : ""}${width ? `w-${width}` : ""}${height ? `h-${height}` : ""}]`;
        codemirror.current?.view?.dispatch(
            codemirror.current?.view?.state.replaceSelection(inLatex ? `\\text{${dropZoneSyntax}}` : dropZoneSyntax)
        );
    }, [width, height, index, inLatex, codemirror]);

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
        }}>{wide ? "Add cloze drop-zone" : "➕ drop-zone"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                <Label for={"drop-zone-width"}>Width:</Label>
                <Input id={"drop-zone-width"} placeholder={"Default"} onChange={ifValidNumericalInputThen(setWidth)}/>
                <hr/>
                <Label for={"drop-zone-height"}>Height:</Label>
                <Input id={"drop-zone-height"} placeholder={"Default"} onChange={ifValidNumericalInputThen(setHeight)} />
                <hr/>
                <Label for={"drop-zone-index"}>Index override:</Label>
                <Input id={"drop-zone-index"} placeholder={"None"} onChange={ifValidNumericalInputThen(setIndex)} />
                <hr/>
                <InputGroup className={"pl-4"}>
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