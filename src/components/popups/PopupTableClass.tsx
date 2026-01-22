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
    const [topScrollable, setTopScrollable] = useState<boolean>(false);
    const tableRegex = /<table(.*class=")(.*)(".*)>/i;

    const makeTableClass = (className: string) => (view: EditorView | undefined) => {
        if (!view) return false;
        const docText = view.state.doc.toString();

        const withAmendedClass = tableRegex.test(docText) ? 
            docText.replace(
                tableRegex,
                `<table$1${className}$3>`
            ) : 
            docText.replace(
                /<table(.*)>/i,
                `<table class="${className}"$1>`
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
            const tableClasses = codemirror.current?.view?.state.doc.toString().match(tableRegex)?.[2];
            setClasses(tableClasses ?? "");
            setExpandable(tableClasses?.includes("expandable") ?? false);
            setTopScrollable(tableClasses?.includes("topScrollable") ?? false);
        }}>{wide ? "Augment table" : "Table"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                {isAda && <InputGroup className={"ps-4"}>
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
                <InputGroup className={"ps-4"}>
                    <Label for={"table-topScrollable"}>Top-scrollable</Label>
                    <Input type="checkbox" id="table-topScrollable" checked={topScrollable} onChange={e => {
                        setTopScrollable(e.target.checked);
                        if (e.target.checked) {
                            setClasses(prev => prev ? `${prev} topScrollable` : "topScrollable");
                        } else {
                            setClasses(prev => prev?.replace(/\bscrollable\b/g, "").trim());
                        }
                    }}/>
                </InputGroup>
                <Label for={"table-classes"}>Class:</Label>
                <Input id={"table-classes"} placeholder={"e.g. text-center"} value={classes} onChange={(e) => setClasses(e.target.value)}/>
                <hr/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!classes && !expandable && !topScrollable} onClick={() => {
                        makeTableClass(classes)(codemirror.current?.view);
                        setExpandable(false);
                        setTopScrollable(false);
                        setClasses("");
                        close?.();
                    }}>
                        Add class
                    </Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>;
};
