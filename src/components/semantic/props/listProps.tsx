import React, { useCallback, useMemo } from "react";

import { Content, ContentBase } from "../../../isaac-data-types";
import { useFixedRef } from "../../../utils/hooks";

import { ContentType, PresenterProps } from "../registry";
import { ListChildrenPresenter } from "../presenters/ListChildrenPresenter";
import { SemanticItem } from "../SemanticItem";

export type ChildTypeOverride = {
  childTypeOverride?: ContentType;
};

type ListPresenterPropProps<T> = Omit<ListExtractorProps<T>, "type"> & ChildTypeOverride;

export function ListPresenterProp<T extends ContentBase>({ childTypeOverride, ...props }: ListPresenterPropProps<T>) {
  const newProps = useTypedListExtractor({ ...props, type: "content" });
  return <ListChildrenPresenter {...newProps} childTypeOverride={childTypeOverride} />;
}

export function SemanticListProp<T extends ContentBase>(props: ListExtractorProps<T>) {
  const newProps = useTypedListExtractor(props);

  return <SemanticItem {...newProps} />;
}

type ListExtractorProps<T> = PresenterProps<T> & {
  prop: keyof T;
  type: ContentType;
};
function useTypedListExtractor<T>({ doc, update, prop, type }: ListExtractorProps<T>) {
  const docRef = useFixedRef(doc);
  const child = useMemo(() => {
    return {
      type,
      children: (doc[prop] as unknown as ContentBase[]) ?? [],
    };
  }, [doc, prop, type]);

  const updateChild = useCallback(
    (newContent: Content, invertible?: boolean) => {
      update(
        {
          ...docRef.current,
          [prop]: newContent.children,
        },
        invertible,
      );
    },
    [docRef, prop, update],
  );
  return { doc: child, update: updateChild };
}
