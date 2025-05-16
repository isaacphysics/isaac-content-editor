import React, {useState} from "react";
import useSWR from "swr";
import {Content} from "../../../isaac-data-types";
import {stagingFetcher} from "../../../services/isaacApi";
import {PresenterProps} from "../registry";
import { ArrayPropValueConstraintContext, ArrayPropPresenterInner } from "./ArrayPropPresenter";

export function RelatedContentPresenter({doc, update}: PresenterProps) {
    const [searchString, setSearchString] = useState("");

    const {data: relatedContent} = useSWR<{results: Content[]}>(
        searchString !== "" ? "search?query=" + encodeURIComponent(searchString) + "&types=isaacConceptPage,isaacQuestionPage" : null,
        stagingFetcher,
    );

    return <ArrayPropValueConstraintContext.Provider value={{searchString, setSearchString, content: relatedContent?.results ?? []}}>
        <ArrayPropPresenterInner 
            doc={doc} update={update} prop="relatedContent" getChildId={(c: Content) => c.id ?? ""} 
            calculateButtonProps={(c: Content) => ({
                color: c.type === "isaacQuestionPage" ? "success" : "primary",
            })}
        />
    </ArrayPropValueConstraintContext.Provider>;
}
