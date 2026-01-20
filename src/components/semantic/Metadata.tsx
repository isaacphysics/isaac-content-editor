import React, {ChangeEvent, ContextType, useContext, useState} from "react";
import { Col, Form, FormText, Input, Label, Row } from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

import { Content } from "../../isaac-data-types";

import { PresenterProps } from "./registry";
import { MetaItems } from "./metaItems";
import { AppContext } from "../../App";

import styles from "./styles/metadata.module.css";

export interface MetaOptions {
    hasWarning?: (value: unknown, context: ContextType<typeof AppContext>) => string | undefined;
    type?: InputType;
    presenter?: React.FunctionComponent<MetaItemPresenterProps>;
    defaultValue?: unknown;
    deleteIfEmpty?: boolean;
    options?: Record<string, string>;
}
type MetaItem = string | [string, MetaOptions];

// This identity helper function exists to generate the type T, which is record scoped to our
// particular keys, which means we can extract the useful type MetaItemKey below.
// See, for example, https://stackoverflow.com/a/67453994.
export function asMetaItems<T extends Record<string, MetaItem>>(metaItems: T) {
    return metaItems;
}

export type MetaItemKey = keyof typeof MetaItems;

export const defaultMeta: MetaItemKey[] = ["tags", "id", "title", "subtitle", "author"];

function getMetaItem(item: MetaItemKey): [string, MetaOptions] {
    const metaItem = MetaItems[item];
    if (Array.isArray(metaItem)) {
        return metaItem;
    }
    return [metaItem, {}];
}

export function checkWarning(options: MetaOptions | undefined, newValue: unknown, setWarning: (value: (string | undefined)) => void, context: ContextType<typeof AppContext>) {
    if (options?.hasWarning) {
        const warning = options.hasWarning(newValue, context);
        if (warning) {
            setWarning(warning);
        } else {
            setWarning(undefined);
        }
    }
}

export type MetaItemPresenterProps<D extends Content = Content> =
    PresenterProps<D>
    & {
        id?: string;
        prop: string;
        name: string;
        options?: MetaOptions
    }
;

export function MetaItemPresenter({doc, update, id, prop, name, options}: MetaItemPresenterProps) {
    const [warning, setWarning] = useState<string>();
    const context = useContext(AppContext);

    const value: string | undefined = doc[prop as keyof Content] as string ?? options?.defaultValue;

    const onChange = (value: string) => {
        let newValue: unknown = value;
        switch (options?.type) {
            case "number": newValue = parseInt(value, 10); break;
        }
        checkWarning(options, newValue, setWarning, context);
        if (options?.deleteIfEmpty && value.replace(/\s/g, "").length === 0) {
            newValue = undefined;
        }
        update({
            ...doc,
            [prop]: newValue,
        });
    };

    const valueOnChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
    const checkedOnChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked as unknown as string);

    return <>
        <Input type={options?.type ?? "text"}
            value={options?.type !== "checkbox" ? value : undefined}
            checked={options?.type === "checkbox" ? value as unknown as boolean : undefined}
            onChange={options?.type !== "checkbox" ? valueOnChange : checkedOnChange}
            invalid={!!warning}
            // eslint-disable-next-line react/no-children-prop
            children={options?.options && Object.entries(options?.options).map(([key, label]) =>
                <option key={key} value={key}>{label}</option>
            )}
            placeholder={name}
            id={id}
        />
        {warning && <FormText>{warning}</FormText>}
    </>;
}

let metaLabelId = 0;
export function MetadataPresenter(props: PresenterProps & { metadata: MetaItemKey[] }) {
    const {metadata, ...rest} = props;
    return <Form>
        {metadata.map((prop) => {
            const [name, options] = getMetaItem(prop);
            const Presenter = options.presenter ?? MetaItemPresenter;
            const id = `meta-label-${metaLabelId++}`;
            return <Row key={prop} className={styles.row}>
                <Col xs={2} className={styles.label}>
                    <Label for={id}>{name}</Label>
                </Col>
                <Col xs={10}>
                    <Presenter {...rest} prop={prop} id={id} name={name} options={options} />
                </Col>
            </Row>;
        })}
    </Form>;
}
