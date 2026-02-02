import {Content, Item} from "../../../isaac-data-types";
import { EditableText, EditableTextProps, EditableTextRef } from "./EditableText";
import React, { forwardRef } from "react";
import { KeysWithValsOfType } from "../../../utils/types";
import { PresenterProps } from "../registry";
import Select from "react-select";
import { Label } from "reactstrap";
import { generateGuid } from "../../../utils/strings";

export type CustomTextProps = Omit<EditableTextProps, "onSave" | "text">;
export type EditableDocProps<D extends Content> =
    & PresenterProps<D>
    & CustomTextProps;

export const EditableDocPropFor = <
    D extends Content,
    K extends KeysWithValsOfType<D, string | undefined> = KeysWithValsOfType<D, string | undefined>,
>(prop: K, defaultProps?: CustomTextProps) => {
    const typedRender = ({doc, update, ...rest}: EditableDocProps<D>, ref: React.ForwardedRef<EditableTextRef>) => {
        return <EditableText
            onSave={(newText) => {
                update({
                    ...doc,
                    [prop]: newText,
                });
            }}
            // unfortunately, while this typing is correct (i.e. should work without these 'as'), TS cannot correctly infer it - see https://github.com/microsoft/TypeScript/issues/48992 and related
            text={doc[prop] as unknown as string | undefined}
            {...defaultProps}
            {...rest}
            ref={ref} />;
    };
    return forwardRef(typedRender);
};

export const EditableDocPropWithStyle = <
    D extends Content,
    O extends {value: string | undefined; label: string;}[],
    K extends KeysWithValsOfType<D, string | undefined> = KeysWithValsOfType<D, string | undefined>,
>(
    prop: K,
    options: O,
    label?: string,
    defaultValue?: O[number],
    defaultProps?: CustomTextProps
) => {
    const typedRender = ({doc, update, ...rest}: EditableDocProps<D>) => {
        const docProp = doc[prop] as unknown as string | undefined;
        const id = generateGuid();
        return <div className="d-flex align-items-center mb-3">
            <Label for={id} className="m-0 me-2">{label || "Select style:"}</Label>
            <Select inputId={id}
                isClearable
                onChange={option => {
                    update({
                        ...doc,
                        [prop]: option?.value ? `${docProp?.split("/")[0]}/${option.value}` : docProp?.split("/")[0]
                        // if using the undefined (default) option, remove the style from the docProp
                    });
                }}
                value={options.find(o => o.value === docProp?.split("/")[1]) ?? defaultValue}
                options={options}
                placeholder={"Select style..."}
                menuPortalTarget={document.body}
                styles={{menuPortal: (base) => ({...base, zIndex: 10})}}
                {...defaultProps}
                {...rest}
            />
        </div>;
    };
    return typedRender;
};

function arrayWith<T>(array: T[], index: number, value: T): T[] {
    if (index >= array.length) {
        array.length = index + 1;
    }
    return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

export const EditableDimensionalDocProp = <
    D extends Content,
    K extends KeysWithValsOfType<D, (string | undefined)[]> = KeysWithValsOfType<D, (string | undefined)[]>
    // we require that the prop be an array of strings as the EditableText component used to edit each only supports strings;
    // there is no strict requirement that this be the case, but the implementation is not fully generic
>(
    prop: K,
    defaultProps?: CustomTextProps
) => {
    const typedRender = ({doc, update, dimension, ...rest }: EditableDocProps<D> & {dimension: number}, ref: React.ForwardedRef<EditableTextRef>) => {
        const currentVal = doc[prop] as unknown as (string | undefined)[];
        return <EditableText
            onSave={(newText) => {
                update({
                    ...doc,
                    [prop]: arrayWith(currentVal ?? new Array<string>(dimension).fill(""), dimension, newText ?? "")
                });
            }}
             
            // @ts-ignore
            text={doc[prop] ? (doc[prop][dimension] ?? "") : ""}
            {...defaultProps}
            {...rest}
            ref={ref}
        />;
    };
    return forwardRef(typedRender);
};

export const EditableIDProp = EditableDocPropFor("id", {block: true});
export const EditableTitleProp = EditableDocPropFor("title", {format: "latex", block: true});
export const EditableSubtitleProp = EditableDocPropFor("subtitle", {block: true});
export const EditableValueProp = EditableDocPropFor("value", {block: true});
export const EditableAltTextProp = EditableDocPropFor<Item>("altText", {block: true, label: "Accessible alt text"});
