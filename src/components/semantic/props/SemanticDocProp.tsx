import React, { useCallback } from "react";

import { Content, ContentBase } from "../../../isaac-data-types";

import { SemanticItem, SemanticItemProps } from "../SemanticItem";
import { useFixedRef } from "../../../utils/hooks";

type SemanticDocProps<K extends string, D extends Content> = D extends { [k in K]?: ContentBase }
  ? SemanticItemProps<D> & { prop: K }
  : never;

const emptyContent = {
  type: "content",
  value: "",
  encoding: "markdown",
};

export const SemanticDocProp = <K extends string, D extends Content>({
  doc,
  update,
  prop,
  ...rest
}: SemanticDocProps<K, D>) => {
  const subDoc = (doc[prop] as Content) ?? emptyContent;
  const docRef = useFixedRef(doc);
  const childUpdate = useCallback(
    (newContent: Content, invertible?: boolean) => {
      update(
        {
          ...docRef.current,
          [prop]: newContent,
        },
        invertible,
      );
    },
    [docRef, update, prop],
  );
  return <SemanticItem doc={subDoc} update={childUpdate} {...rest} />;
};
