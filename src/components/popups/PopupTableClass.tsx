import React, {RefObject, useRef, useState} from "react";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";
import {Button, Container, Input, InputGroup, Label} from "reactstrap";
import {EditorView, ReactCodeMirrorRef} from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";
import { isAda } from "../../services/site";

export const PopupTableClass = ({wide, codemirror}: {wide: boolean, codemirror: RefObject<ReactCodeMirrorRef>}) => {
    const popupRef = useRef<PopupRef>(null);

    const [classes, setClasses] = useState<string>("");
    const [expandable, setExpandable] = useState<boolean>(false);
    const [scrollable, setScrollable] = useState<boolean>(false);

    const makeTableClass = (className: string) => (view: EditorView | undefined) => {
        if (!view) return false;
        const docText = view.state.doc.toString();

        const withAmendedClass = docText.includes('class=') ? 
            docText.replace(
                /<table(.*class=")([A-Z,0-9 ]*)(".*)>/i,
                `<table$1${className}$3>`
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
            const tableClasses = codemirror.current?.view?.state.doc.toString().match(/<table(.*class=")([A-Z,0-9 ]*)(".*)>/i)?.[2];
            setClasses(tableClasses ?? "");
            setExpandable(tableClasses?.includes("expandable") ?? false);
            setScrollable(tableClasses?.includes("scrollable") ?? false);
        }}>{wide ? "Augment table" : "Table"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                {isAda && <InputGroup className={"pl-4"}>
                    <Label for={"table-expandable"}>Expandable</Label>
                    <Input type="checkbox" id="table-expandable" checked={expandable} onChange={e => { 
                            setExpandable(e.target.checked);
                            if (e.target.checked) {
                                setClasses(prev => prev ? `${prev} expandable` : "expandable");
                            } else {
                                setClasses(prev => prev?.replace(/\bexpandable\b/g, "").trim());
                            }
                        }} 
                    />
                </InputGroup>}
                <InputGroup className={"pl-4"}>
                    <Label for={"table-scrollable"}>Top-scrollable</Label>
                    <Input type="checkbox" id="table-scrollable" checked={scrollable} onChange={e => {
                            setScrollable(e.target.checked);
                            if (e.target.checked) {
                                setClasses(prev => prev ? `${prev} scrollable` : "scrollable");
                            } else {
                                setClasses(prev => prev?.replace(/\bscrollable\b/g, "").trim());
                            }
                        }}/>
                </InputGroup>
                <Label for={"table-classes"}>Class:</Label>
                <Input id={"table-classes"} placeholder={"e.g. text-centre"} value={classes} onChange={(e) => setClasses(e.target.value)}/>
                <hr/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!classes && !expandable && !scrollable} onClick={() => {
                        makeTableClass(classes)(codemirror.current?.view);
                        setExpandable(false);
                        setScrollable(false);
                        setClasses("");
                        close?.();
                    }}>
                        Add class
                    </Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>;
}
