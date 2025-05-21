import React from "react";
import { Button } from "reactstrap";

import { IsaacBookDetailPage, IsaacBookIndexPage, IsaacEventPage, IsaacQuiz, IsaacQuizSection } from "../../../isaac-data-types";

import { PresenterProps } from "../registry";
import { SemanticDocProp } from "../props/SemanticDocProp";
import { EditableSubtitleProp, EditableTitleProp } from "../props/EditableDocProp";
import { ListChildrenPresenter } from "./ListChildrenPresenter";
import {EMPTY_DOCUMENTS} from "../../../services/emptyDocuments";
import { ContentValueOrChildrenPresenter } from "./ContentValueOrChildrenPresenter";
import { ArrayPropPresenter } from "./ArrayPropPresenter";
import { ListPresenterProp } from "../props/listProps";

export function PagePresenter(props: PresenterProps) {
    return <>
        <h1><EditableTitleProp {...props} placeHolder="Page title" /></h1>
        <h2><EditableSubtitleProp {...props} placeHolder="Page subtitle" hideWhenEmpty/></h2>
    </>;
}

export function QuizPagePresenter(props: PresenterProps<IsaacQuiz>) {
    return <>
        <PagePresenter {...props} />
        {props.doc.rubric ?
            <SemanticDocProp {...props} prop="rubric" name="Rubric" onDelete={() => props.update({...props.doc, rubric: undefined}, true)} /> :
            <Button color="secondary" outline onClick={() => props.update({...props.doc, rubric: (EMPTY_DOCUMENTS['isaacQuiz'] as IsaacQuiz).rubric})}>
                Add rubric
            </Button>}
        <h2>Test Sections</h2>
        <ListChildrenPresenter {...props} childTypeOverride="isaacQuizSection" />
    </>;
}

export function QuizSectionPresenter(props: PresenterProps<IsaacQuizSection>) {
    return <>
        <h3><EditableTitleProp {...props} label="Title" /></h3>
    </>;
}

export function EventPagePresenter(props: PresenterProps<IsaacEventPage>) {
    const {doc} = props
    return <>
        <PagePresenter {...props} />
        {doc.location && <>
            {doc.location.address?.addressLine1 || doc.location.address?.county ?
                <Button color="link">
                    {doc.location.address?.addressLine1}, {doc.location.address?.county}
                </Button>
                : "Unknown location"
            }
            <br />
        </>}
        <SemanticDocProp {...props} prop="eventThumbnail" name="Thumbnail"/>
    </>;
}

export function BookDetailPagePresenter(props: PresenterProps<IsaacBookDetailPage>) {
    return <>
        <h3>Gameboards</h3>
        <ArrayPropPresenter {...props} prop="gameboards" />
        <h3>Page content</h3>
        <ContentValueOrChildrenPresenter {...props} />
        <h3>Extension gameboards</h3>
        <ArrayPropPresenter {...props} prop="extensionGameboards" />
    </>
}

export function BookIndexPagePresenter(props: PresenterProps<IsaacBookIndexPage>) {
    return <>
        <h3>Page content</h3>
        <ContentValueOrChildrenPresenter {...props} />
        <h3>Chapters</h3>
        <ListPresenterProp {...props} prop="chapters" childTypeOverride="bookChapter" />
    </>
}
