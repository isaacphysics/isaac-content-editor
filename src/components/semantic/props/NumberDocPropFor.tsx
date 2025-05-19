import React, { forwardRef } from "react";

import { Content } from "../../../isaac-data-types";
import { KeysWithValsOfType } from "../../../utils/types";

import { EditableText, EditableTextRef } from "./EditableText";
import { CustomTextProps, EditableDocProps } from "./EditableDocProp";

export const NumberDocPropFor = <D extends Content,
    K extends KeysWithValsOfType<D, number | undefined> = KeysWithValsOfType<D, number | undefined>,
    >(prop: K, defaultProps?: CustomTextProps) => {
    const typedRender = ({
                            doc,
                            update,
                            ...rest
                        }: EditableDocProps<D>, ref: React.ForwardedRef<EditableTextRef>) => {
        return <EditableText
            hasError={(newText) => {
                if (newText) {
                    newText = newText.trim();
                    const num = parseInt(newText, 10);
                    if (isNaN(num) || num.toString() !== newText) {
                        return "Not a number";
                    }
                }
            }}
            onSave={(newText) => {
                update({
                    ...doc,
                    [prop]: newText ? parseInt(newText, 10) : undefined,
                });
            }}
            text={(doc[prop] as unknown as number | undefined)?.toString()}
            {...defaultProps}
            {...rest}
            ref={ref}/>
    };
    return forwardRef(typedRender);
};
