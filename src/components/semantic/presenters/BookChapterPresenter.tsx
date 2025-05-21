import React from "react";
import { BookChapter } from "../../../isaac-data-types";
import { EditableDocPropFor, EditableTitleProp } from "../props/EditableDocProp";
import { PresenterProps } from "../registry";
import { ListPresenterProp } from "../props/listProps";

const EditableLabelProp = EditableDocPropFor<BookChapter>("label", {block: true, placeHolder: "Chapter label"});

export const BookChapterPresenter = (props: PresenterProps<BookChapter>) => {
    return <>
        <div className="d-flex">
            <EditableLabelProp {...props} />
            : &nbsp;
            <EditableTitleProp {...props} placeHolder="Chapter title" />
        </div>
        <ListPresenterProp {...props} prop="sections" childTypeOverride="bookSection" />
    </>;
}
