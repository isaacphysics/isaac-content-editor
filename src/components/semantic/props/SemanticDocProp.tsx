import React, { useCallback } from "react";

import { Content, ContentBase } from "../../../isaac-data-types";

import { SemanticItem, SemanticItemProps } from "../SemanticItem";
import { useFixedRef } from "../../../utils/hooks";

// type requires that:
// - K is a key of D
// - D[K] is optional and, if present, of type ContentBase
type SemanticDocProps<K extends string & keyof D, D extends Content> = SemanticItemProps<D> & { prop: K } & {[key in K]?: ContentBase};

const emptyContent = {
    type: "content",
    value: "",
    encoding: "markdown",
};

export const SemanticDocProp = <K extends string & keyof D, D extends Content>({doc, update, prop, ...rest}: SemanticDocProps<K, D>) => {
    const subDoc = doc[prop] as Content ?? emptyContent;
    const docRef = useFixedRef(doc);
    const childUpdate = useCallback((newContent: Content, invertible?: boolean) => {
        update({
            ...docRef.current,
            [prop]: newContent,
        }, invertible);
    }, [docRef, update, prop]);
    return <SemanticItem doc={subDoc} update={childUpdate} {...rest} />;
};
