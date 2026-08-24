import {PresenterProps} from "../registry";
import React from "react";
import {ContentValueOrChildrenPresenter} from "./ContentValueOrChildrenPresenter";
import {EnumPropFor} from "../props/EnumProp";
import {siteSpecific} from "../../../services/site";

export const EditableStyleProp = EnumPropFor("subtitle", siteSpecific(
    {
        regular: "Regular"
    }, {
        regular: "Regular",
        testData: "Test Data",
        sampleRun: "Sample Run",
        scenario: "Scenario",
        definition: "Definition",
    }
));

export function CalloutPresenter(props: PresenterProps) {
    return <>
        <EditableStyleProp {...props} />
        <ContentValueOrChildrenPresenter {...props}/>
    </>;
}
