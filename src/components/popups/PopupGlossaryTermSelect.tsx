import React, {RefObject, useCallback, useMemo, useRef, useState} from "react";
import {Popup, PopupCloseContext, PopupRef} from "./Popup";
import {Alert, Button, Container, Input, InputGroup, Label} from "reactstrap";
import {ReactCodeMirrorRef} from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";
import useSWR from "swr";
import {GlossaryTerm} from "../../isaac-data-types";
import {stagingFetcher} from "../../services/isaacApi";
import Select from "react-select";
import {Item} from "../../utils/select";
import {isDefined} from "../../utils/types";
import {isPhy, isAda} from "../../services/site";
import { stageList, stagePrintList, subjectList } from "../../services/constants";

export const PopupGlossaryTermSelect = ({wide, codemirror}: { wide?: boolean, codemirror: RefObject<ReactCodeMirrorRef> }) => {
    const popupRef = useRef<PopupRef>(null);

    const {data: glossaryTerms} = useSWR<{results: GlossaryTerm[]}>(
        "glossary/terms?limit=10000",
        stagingFetcher
    );
    const [filterSubject, setFilterSubject] = useState<string>();
    const [filterStage, setFilterStage] = useState<string>();

    const subjectListOptions: Item<string>[] = subjectList.map(
        subject => ({value: subject, label: subject.charAt(0).toUpperCase() + subject.slice(1)})
    );
    const stageListOptions: Item<string>[] = stageList.map(
        (stage, index) => ({value: stage, label: stagePrintList.at(index) ?? "Unknown"})
    );

    const glossaryTermOptions: Item<string>[] = useMemo(() =>
        glossaryTerms?.results.filter(
            gt => {
                let keep = isDefined(gt.id);
                if (filterSubject) keep = (gt.tags?.includes(filterSubject) ?? false) && keep;
                if (filterStage) keep = (gt.stages?.includes(filterStage) ?? false) && keep;
                return keep;
            }
        ).map(
            gt => {
                let label = gt.value ?? gt.id as string;
                if (isPhy) label += " [id: " + gt.id as string + "]";
                return ({value: gt.id as string, label: label});
            }
        ) ?? [], [glossaryTerms, filterStage, filterSubject]);

    const [glossaryTermText, setGlossaryTermText] = useState<string>();
    const [glossaryTerm, setGlossaryTerm] = useState<Item<string> | undefined>();
    const [isInlineTerm, setIsInlineTerm] = useState<boolean>(true);
    const [isTitledTerm, setIsTitledTerm] = useState<boolean>(isAda); // Ada should default to being checked

    const generateAndInsertGlossaryTerm = useCallback(() => {
        if (glossaryTerm) {
            const trimmedGlossaryTermText = glossaryTermText?.trim();
            codemirror.current?.view?.dispatch(codemirror.current?.view?.state.replaceSelection(`[glossary${isInlineTerm ? "-inline" : ""}${isInlineTerm && isTitledTerm ? "-titled" : ""}:${glossaryTerm.value}${isInlineTerm && trimmedGlossaryTermText ? ` "${trimmedGlossaryTermText}"` : ""}]`)
            );
        }
    }, [glossaryTermText, glossaryTerm, isInlineTerm, isTitledTerm, codemirror]);

    return <>
        <button className={styles.cmPanelButton} title={"Insert glossary term"} onClick={(event) => {
            popupRef.current?.open(event);
        }}>{wide ? "Add glossary term" : "➕ glossary"}</button>
        <Popup popUpRef={popupRef}>
            <Container className={styles.cmPanelPopup}>
                {isPhy && <>
                    <Label for={"glossary-subject-select"}>Select subject:</Label>
                    <Select inputId="glossary-subject-select"
                        isClearable
                        onChange={e => setFilterSubject(e ? e.value : undefined)}
                        options={subjectListOptions}
                        placeholder={"Type to search subjects"} />
                    <Label for={"glossary-stage-select"}>Select stage:</Label>
                    <Select inputId="glossary-stage-select"
                        isClearable
                        onChange={e => setFilterStage(e ? e.value : undefined)}
                        options={stageListOptions}
                        placeholder={"Type to search stages"} />
                </>}
                <Label for={"glossary-term-id-select"}>Select glossary term:</Label>
                <Select inputId="glossary-term-id-select"
                    onChange={e => setGlossaryTerm(e ? {value: e.value, label: e.label} : undefined)}
                    options={glossaryTermOptions}
                    placeholder={"Type to search terms"} />
                <hr/>
                <InputGroup className={"ps-4"}>
                    <Label for={"glossary-term-full-or-inline"}>Inline glossary term?</Label>
                    <Input type={"checkbox"} id="glossary-term-full-or-inline" onChange={e => setIsInlineTerm(e.target.checked)} checked={isInlineTerm}/>
                </InputGroup>
                {isInlineTerm ?
                    <>
                        <InputGroup className={"ps-4"}>
                            <Label for={"glossary-term-titled-or-not"}>Titled glossary term?</Label>
                            <Input type={"checkbox"} id="glossary-term-titled-or-not" onChange={e => setIsTitledTerm(e.target.checked)} checked={isTitledTerm}/>
                        </InputGroup>
                        <Label for={"term-text-input"}>Text to display:</Label>
                        <Input id={"term-text-input"} placeholder={glossaryTerm?.label ?? "None"} value={glossaryTermText} onChange={(e) => setGlossaryTermText(e.target.value)} />
                    </>
                    :
                    <Alert color={"warning"}>
                        Please note: non-inline glossary terms can <b>only</b> be placed at the beginning of a line.
                    </Alert>
                }
                <hr/>
                <PopupCloseContext.Consumer>
                    {close => <Button disabled={!glossaryTerm} onClick={() => {
                        generateAndInsertGlossaryTerm();
                        setGlossaryTerm(undefined);
                        setGlossaryTermText(undefined);
                        setIsInlineTerm(true);
                        close?.();
                    }}>
                        Generate markup
                    </Button>}
                </PopupCloseContext.Consumer>
            </Container>
        </Popup>
    </>;
};
