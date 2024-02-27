import React, { forwardRef } from "react";

import { Content } from "../../../isaac-data-types";
import { KeysWithValsOfType } from "../../../utils/types";

import { EditableText, EditableTextRef } from "./EditableText";
import { CustomTextProps, EditableDocProps } from "./EditableDocProp";

export const NumberDocPropFor = <
  D extends Content,
  K extends KeysWithValsOfType<D, number | undefined> = KeysWithValsOfType<D, number | undefined>,
>(
  prop: K,
  defaultProps?: CustomTextProps,
) => {
  const typedRender = <D extends Content>(
    { doc, update, ...rest }: EditableDocProps<D>,
    ref: React.ForwardedRef<EditableTextRef>,
  ) => {
    return (
      <EditableText
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
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        text={doc[prop]?.toString()}
        {...defaultProps}
        {...rest}
        ref={ref}
      />
    );
  };
  return forwardRef(typedRender);
};
