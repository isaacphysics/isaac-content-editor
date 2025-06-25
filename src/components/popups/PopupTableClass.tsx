import React, {RefObject, useRef, useState} from "react";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";
import {Button, Container, Input, Label} from "reactstrap";
import {EditorView, ReactCodeMirrorRef} from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";

export const PopupTableClass = ({wide, codemirror}: {wide: boolean, codemirror: RefObject<ReactCodeMirrorRef>}) => {
    const popupRef = useRef<PopupRef>(null);

    const [classes, setClasses] = useState<string>("");

    const makeTableClass = (className: string) => (view: EditorView | undefined) => {
        if (!view) return false;
        const docText = view.state.doc.toString();

        const withAmendedClass = docText.includes('class=') ? 
            docText.replace(
                /<table(.*class=")([A-Z,0-9 ]*)(".*)>/i,
                `<table$1$2 ${className}$3>`
            ) : 
            docText.replace(
                /<table(.*)>/i,
                `<table class="${className}"$1`
            );

        if (withAmendedClass !== docText) {
            view.dispatch({
                changes: { from: 0, to: docText.length, insert: withAmendedClass }
            });
            return true;
        }

        return true;
    };

    return <>
        <button className={styles.cmPanelButton} title={"Augment table"} onClick={(event) => {
            popupRef.current?.open(event);
        }}>{wide ? "Augment table" : "Table"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                <Label for={"inline-part-classes"}>Classes:</Label>
                <Input id={"inline-part-classes"} placeholder={"e.g. wf-8"} onChange={(e) => setClasses(e.target.value)}/>
                <hr/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!classes} onClick={() => {
                        makeTableClass(classes)(codemirror.current?.view);
                        close?.();
                    }}>
                        Add class
                    </Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>
}
