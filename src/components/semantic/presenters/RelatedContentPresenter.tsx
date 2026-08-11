import React, {useState} from "react";
import useSWR from "swr";
import {Content} from "../../../isaac-data-types";
import {stagingFetcher} from "../../../services/isaacApi";
import {PresenterProps} from "../registry";
import { ArrayPropValueConstraintContext, ArrayPropPresenterInner } from "./ArrayPropPresenter";

export function RelatedContentPresenter({doc, update}: PresenterProps) {
    const [searchString, setSearchString] = useState("");

    // TODO the site search endpoint currently doesn't include fasttrack questions, so we're using a separate endpoint call to ensure we can get those.
    // TODO if/when site search allows fasttracks, merge these two calls together.

    const {data: relatedNonFastTrack} = useSWR<{results: Content[]}>(
        searchString !== "" ? "search?query=" + encodeURIComponent(searchString) + "&types=isaacConceptPage,isaacQuestionPage" : null,
        stagingFetcher,
    );

    const {data: relatedFastTrack} = useSWR<{results: Content[]}>(
        searchString !== "" ? "pages/questions?searchString=" + encodeURIComponent(searchString) + "&fasttrack=true" : null,
        stagingFetcher,
    );

    const relatedContent = [...(relatedNonFastTrack?.results ?? []), ...(relatedFastTrack?.results ?? [])];

    return <ArrayPropValueConstraintContext.Provider value={{searchString, setSearchString, content: relatedContent ?? [], mapContentToId: (c: Content) => c.id ?? ""}}>
        <ArrayPropPresenterInner 
            doc={doc} update={update} prop="relatedContent" getChildId={(c: string) => c ?? ""} 
            calculateButtonProps={(c: Content) => ({
                color: c.type === "isaacQuestionPage" ? "success" : c.type === "isaacFastTrackQuestionPage" ? "secondary" : "primary",
            })}
        />
    </ArrayPropValueConstraintContext.Provider>;
}
