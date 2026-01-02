/* eslint-disable no-irregular-whitespace */  // For convenient construction of non-breaking spaces in custom strings
import React, { MutableRefObject, useCallback, useMemo, useRef, useState } from "react";
import {Button, ButtonGroup} from "reactstrap";

import { Content, IsaacTabs } from "../../../isaac-data-types";
import { safeLowercase } from "../../../utils/strings";
import { useFixedRef } from "../../../utils/hooks";

import { SemanticItem } from "../SemanticItem";
import { deriveNewDoc } from "./ListChildrenPresenter";
import { EditableDocPropWithStyle, EditableIDProp, EditableTitleProp } from "../props/EditableDocProp";
import { EditableTextRef } from "../props/EditableText";
import { PresenterProps } from "../registry";
import styles from "../styles/tabs.module.css";
import { useKeyedList, useWithIndex } from "../../../utils/keyedListHook";
import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { isAda } from "../../../services/site";

export type TabsSettings = {
    emptyDescription: string;
    elementName: string;
    styles: Record<"button"|"buttons"|"buttonsSpacer"|"buttonsFill"|"main"|"header"|"hideMargins"|"buttonsShifter"|"empty", string>;
    suppressHeaderNames?: boolean;
    showTitles: boolean;
};

export type TabsProps = {
    docRef: MutableRefObject<Content>;
    currentChild: Content | undefined;
    doInsert: (newContent: Content) => void;
    doShift: (amount: number) => void;
    updateCurrentChild: (newContent: Content) => void;
    doRemove: () => void;
    keyList: string[];
    index: number;
    setIndex: (newIndex: number) => void;
} & TabsSettings;

const EditableTabsLayoutProp = EditableDocPropWithStyle("layout", [
    {value: "tabs", label: "Tabs"},
    {value: "buttons", label: "Buttons"},
    {value: "dropdowns", label: "Dropdowns"},
    {value: undefined, label: "Default"}
], "Tab display type:", {value: "tabs", label: "Tabs"}, {block: true});

export function TabsHeader({docRef, doInsert, index, setIndex, elementName, styles, suppressHeaderNames, showTitles}: TabsProps) {
    const elementNameLC = safeLowercase(elementName);
    return <div className={styles.buttons}>
        <div className={styles.buttonsShifter}>
            <div className={styles.buttonsSpacer}/>
            {docRef.current.children?.map((child: Content, i) => {
                return <Button key={child.id || `__index__${i}`}
                    outline
                    color={index === i ? "primary" : undefined}
                    className={styles.button}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    onClick={() => setIndex(i)}>
                    {!suppressHeaderNames && `${elementName} `}{i + 1}{showTitles && child.title && `: ${child.title}`}
                </Button>;
            })}
            <Button key="__add"
                outline
                color="info"
                className={styles.button}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
                onClick={() => {
                    doInsert({type: "content", children: []} as Content);
                    setIndex(docRef.current.children?.length ?? 0);
                }}>
                Add{!suppressHeaderNames && ` ${elementNameLC}`}
            </Button>
            <div className={styles.buttonsFill}/>
        </div>
    </div>;
}

type TabsMainProps = TabsProps & {
    back: string;
    forward: string;
    contentHeader?: JSX.Element;
    extraButtons?: JSX.Element;
};

export function TabsMain({docRef, currentChild, updateCurrentChild, doRemove, doShift, keyList, index, emptyDescription, elementName, styles, suppressHeaderNames, showTitles, back, forward, contentHeader, extraButtons}: TabsMainProps) {
    const elementNameLC = safeLowercase(elementName);

    return <div className={styles.main}>
        {currentChild && <React.Fragment key={keyList[index]}>
            <div className={styles.header}>
                <EditableIDProp doc={currentChild} update={updateCurrentChild} label={`${elementName} ID`} block={false} />
                {extraButtons}
                <ButtonGroup>
                    <Button size="sm" disabled={index <= 0} onClick={() => doShift(-1)}>
                        {back}
                    </Button>
                    <Button size="sm" disabled={index >= (docRef.current.children?.length ?? 1) - 1} onClick={() => doShift(1)}>
                        {forward}
                    </Button>
                </ButtonGroup>
                <Button size="sm" color="danger" onClick={doRemove}>Delete {elementNameLC}</Button>
            </div>
            {contentHeader}
            <SemanticItem className={styles.hideMargins} doc={currentChild} update={updateCurrentChild}/>
        </React.Fragment>}
        {!currentChild && <div className={styles.empty}>
            {emptyDescription}
            <br />
            Click &ldquo;Add{!suppressHeaderNames && ` ${elementNameLC}`}&rdquo; to create a {elementNameLC}.
        </div>}
    </div>;
}

export function useTabs({doc, update}: PresenterProps<IsaacTabs>, settings: TabsSettings) {
    const [index, setIndex] = useState(0);
    const docRef = useFixedRef(doc);

    const deriveNewList: () => [Content, Content[]] = useCallback(() => {
        const newDoc = deriveNewDoc(docRef);
        return [newDoc, newDoc.children];
    }, [docRef]);

    const {
        insert,
        keyList,
        updateChild,
        shiftBy,
        remove
    } = useKeyedList(doc?.children, deriveNewList, update);

    const doInsert = useCallback((newChild: Content) => {
        const newIndex = docRef.current.children?.length ?? 0;
        insert(newIndex, newChild);
        setIndex(newIndex);
    }, [docRef, insert]);
    const updateCurrentChild = useWithIndex(updateChild, index);
    const doShift = useCallback((amount: number) => {
        shiftBy(index, amount);
        setIndex(index + amount);
    }, [index, shiftBy]);
    const doRemove = useCallback(() => {
        const newLastIndex = docRef.current.children ? docRef.current.children.length - 2 : 0;
        remove(index);
        if (index > newLastIndex) {
            setIndex(newLastIndex);
        }
    }, [docRef, index, remove]);

    const editTitleRef = useRef<EditableTextRef>(null);

    const currentChild = docRef.current.children?.[index] as Content | undefined;

    const allProps: TabsProps = {
        docRef,
        currentChild,
        updateCurrentChild,
        doInsert,
        doShift,
        doRemove,
        keyList,
        index,
        setIndex,
        ...settings,
    };

    const currentChildProps = useMemo(() => ({
        doc: currentChild as Content,
        update: updateCurrentChild
    }),
    [currentChild, updateCurrentChild]);

    return {editTitleRef, currentChild, allProps, currentChildProps};
}

export function TabsPresenter(props: PresenterProps<IsaacTabs>) {
    const showTitles = !props.doc.hideTitles;

    const {
        editTitleRef,
        currentChild,
        allProps,
        currentChildProps
    } = useTabs(props, {
        emptyDescription: "These tabs are empty.",
        elementName: "Tab",
        styles,
        suppressHeaderNames: true,
        showTitles,
    });

    return <div className={styles.wrapper}>
        <div className="d-flex">
            <EditableTabsLayoutProp {...props}/>
            {isAda && <CheckboxDocProp className="ml-4 mt-2" doc={props.doc} update={props.update} prop="expandable" label="Expandable" />}
        </div>
        <TabsHeader {...allProps} {...props} />
        <TabsMain {...allProps} back="◀" forward="▶" contentHeader={
            showTitles && currentChild ? <div className={styles.meta}>
                <h3><EditableTitleProp ref={editTitleRef} {...currentChildProps}
                    placeHolder="Tab title" hideWhenEmpty /></h3>
            </div> : undefined
        } extraButtons={<>
            {showTitles && currentChild && !currentChild.title && <Button size="sm" onClick={() => editTitleRef.current?.startEdit()}>Set tab title</Button>}
        </>}/>
    </div>;
}
