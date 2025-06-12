import React from "react";
import { SidebarEntry, Sidebar, SidebarGroup } from "../../../isaac-data-types";
import { EditableDocPropFor, EditableTitleProp } from "../props/EditableDocProp";
import { EnumPropFor } from "../props/EnumProp";
import { ListPresenterProp } from "../props/listProps";
import { PresenterProps } from "../registry";

export enum SidebarEntryType {
    isaacBookDetailPage = "Book Detail Page",
    isaacBookIndexPage = "Book Index Page",
    isaacRevisionDetailPage = "Revision Page",
    page = "Generic Page",
}

const EditableLabelProp = EditableDocPropFor<SidebarEntry>("label", {block: true, placeHolder: "Entry label"});
const EditableSidebarEntryPageIdProp = EditableDocPropFor<SidebarEntry>("pageId", {block: true, placeHolder: "Page ID"});
// const EditableSidebarEntryPageTypeProp = EditableDocPropFor<SidebarEntry>("pageType", {block: true, placeHolder: "Page type"});
const EditableSidebarEntryPageTypeProp = EnumPropFor<SidebarEntry>("pageType", SidebarEntryType)

export function SidebarPresenter(props: PresenterProps<Sidebar>) {
    return <ListPresenterProp {...props} prop="sidebarEntries" childTypeOverride="sidebarEntry" />
}

export function SidebarEntryPresenter(props: PresenterProps<SidebarEntry>) {
    const {doc} = props;
    const isGroup = (d: SidebarEntry): d is SidebarGroup => d.type === "sidebarGroup";

    return <>
        <div className="d-flex">
            <EditableLabelProp {...props} />
            : &nbsp;
            <EditableTitleProp {...props} placeHolder="Entry title" />
        </div>
        <hr/>
        {isGroup(doc) ? (
            <>
                <ListPresenterProp {...props as PresenterProps<SidebarGroup>} prop="sidebarEntries" childTypeOverride="sidebarEntry" />
            </>
        ) : (
            <>
                <div className="d-flex align-items-center mb-2">
                    Page type: &nbsp;
                    <EditableSidebarEntryPageTypeProp {...props} />
                </div>
                <div className="d-flex">
                    Page ID: &nbsp;
                    <EditableSidebarEntryPageIdProp {...props} />
                </div>
            </>
        )}
        {/* <Button color="secondary" outline onClick={() => update({...doc, ...EMPTY_DOCUMENTS[doc.type]})}>
            Reset to empty {doc.type}
        </Button> */}
    </>;
}
