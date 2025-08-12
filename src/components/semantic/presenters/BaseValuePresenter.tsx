import React, {FunctionComponent, MutableRefObject, useCallback, useImperativeHandle, useRef, useState} from "react";
import CodeMirror, {EditorView, ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {markdown} from '@codemirror/lang-markdown';
import {html} from '@codemirror/lang-html';
import {Button} from "reactstrap";

import styles from "../styles/value.module.css";
import {Content} from "../../../isaac-data-types";
import {getEntryType, PresenterProps} from "../registry";
import {keyBindings, spellchecker, wordCounter} from "../../../utils/codeMirrorExtensions";
import {MarkupToolbar} from "../../MarkupToolbar";
import {Markup} from "../../../isaac/markup";

export interface ValuePresenterRef {
    startEdit: () => void;
}
export type ValuePresenterProps<D extends Content = Content> =
    & PresenterProps<D>
    & {
        valueRef?: MutableRefObject<ValuePresenterRef | null>;
        topLevel?: boolean;
    }
;
export type ValuePresenter<D extends Content = Content> = FunctionComponent<ValuePresenterProps<D>>;

export interface ValueProps<V, D extends Content = Content> {
    doc: D;
    value: React.MutableRefObject<V | undefined>;
    editing: boolean;
    set: () => boolean;
    cancel: () => boolean;
}

export function buildValuePresenter<V, D extends Content = Content>(
    Component: FunctionComponent<ValueProps<V, D>>,
    init: (doc: D) => V,
    save: (value: V, doc: D) => D,
): ValuePresenter<D> {
    const VP = ({doc, update, valueRef}: ValuePresenterProps<D>) => {
        const [editing, setEditing] = useState(false);
        const value = useRef<V>();
        const startEdit = useCallback(() => {
            setEditing((currently) => {
                if (!currently) {
                    value.current = init(doc);
                }
                return true;
            });
        }, [doc]);

        useImperativeHandle(valueRef, () => ({
            startEdit: () => {
                startEdit();
            }
        }), [startEdit]);

        function setChanges() {
            setEditing(false);
            update(save(value.current!, doc));
            return true;
        }

        function cancelChanges() {
            setEditing(false);
            return true;
        }

        const component = <Component editing={editing} doc={doc} value={value} set={setChanges} cancel={cancelChanges}/>;
        if (!editing) {
            return <div
                role="button" tabIndex={0} className={styles.editableValue}
                onClick={() => startEdit()} onKeyDown={(e) => {if (e.key === "Enter") startEdit();}}
            >
                {component}
            </div>;
        } else {
            return <>
                {component}
                <div className={`mt-2 ${styles.editButtons}`}>
                    <Button onClick={(e) => {e.stopPropagation(); cancelChanges()}}>Cancel</Button>
                    <Button color="primary" onClick={(e) => {e.stopPropagation(); setChanges()}}>Set</Button>
                </div>
            </>;
        }
    };
    VP.displayName = Component.displayName;
    return VP;
}

export const BaseValue = ({doc, editing, value, set, cancel}: ValueProps<string | undefined>) => {
    const codemirror = useRef<ReactCodeMirrorRef>(null);
    if (!editing) {
        if (!doc.value) {
            const entryType = getEntryType(doc);
            const blankValue = entryType.blankValue || "Enter content here";
            return <p>
                <em>{blankValue}</em>
            </p>;
        }
        switch (doc.encoding) {
            case "html":
                return <Markup trusted-markup-encoding="html">{doc.value}</Markup>;
            case "markdown":
                return <Markup trusted-markup-encoding="markdown">{doc.value}</Markup>;
            case "plain":
                return <pre>{doc.value}</pre>;
            default:
                return <div>{`<${doc.encoding}> ${doc.value}`}</div>;
        }
    } else {
        const encoding = doc.encoding === "markdown" ? [markdown()]
            : doc.encoding === "html" ? [html()]
                : [];
        return <CodeMirror
            ref={codemirror}
            value={value.current}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
            extensions={[
                ...encoding,
                EditorView.lineWrapping,
                wordCounter(),
                keyBindings(set, cancel, doc.encoding),
                spellchecker()
            ]}
            onChange={(newValue) => {
                value.current = newValue;
            }}
        >
            <MarkupToolbar set={set} cancel={cancel} codemirror={codemirror} encoding={doc.encoding} value={value.current}/>
        </CodeMirror>;
    }
};

export const BaseValuePresenter = buildValuePresenter(
    BaseValue,
    (doc) => doc.value,
    (value, doc) => ({...doc, value}),
);


export type ValueRef = React.MutableRefObject<ValuePresenterRef | null>;

export interface ValueWrapperProps {
    valueRef?: ValueRef;
    className?: string;
}

export const ValueWrapper: FunctionComponent<ValueWrapperProps> = ({
    className,
    valueRef,
    children
}) => {
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
    return <div role="cell" className={className} onClick={valueRef && ((e) => {
        // Only catch clicks that are outside any other element
        // FIXME: This misses clicks in the header, and also takes clicks in odd places like padding and empty spaces of an item.
        if (e.target === e.currentTarget) {
            valueRef.current?.startEdit();
        }
    })}>
        {children}
    </div>;
};
