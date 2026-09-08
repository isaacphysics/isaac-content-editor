import React, { useContext } from "react";
import { Alert } from "reactstrap";
import { AppContext } from "../../App";

export const InaccessibleContentWarning = ({tags}: {tags: string[]}) => {
    const currentDoc = useContext(AppContext).editor.getCurrentDoc();
    const alertBlock = [];

    for (const tag of tags) {
        if (!currentDoc.tags?.includes(tag)) {
            alertBlock.push(<Alert color="warning">{`This question type may be inaccessible to some users. The "${tag}" tag should be added to the metadata of this page.`}</Alert>);
        }
    }
    return alertBlock;
};
