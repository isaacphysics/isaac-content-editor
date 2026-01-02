import React, { useEffect, useRef, useState } from "react";
import { Button, Input } from "reactstrap";
import useSWR from "swr";

import { stagingFetcher } from "../../../services/isaacApi";
import { subjectList } from "../../../services/constants";

import { PresenterProps } from "../registry";

import styles from "../styles/tags.module.css";

export function TagsPresenter({doc, update, subjectsOnly}: PresenterProps & {subjectsOnly?: boolean}) {
    const [searchString, setSearchString] = useState("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const {data: tagList} = useSWR<string[]>(
        searchString !== "" ? "content/tags" : null,
        stagingFetcher,
    );
    const searchList = subjectsOnly ? subjectList : tagList;
    const [showTagList, setShowTagList] = useState(true);
    const [filteredTagList, setFilteredTagList] = useState<string[]>();

    useEffect(() => {
        setFilteredTagList(searchList?.filter(tag => tag.includes(searchString) && !doc.tags?.includes(tag)));
    }, [searchString, searchList, doc.tags]);

    function addTag(tag: string) {
        if (doc.tags?.includes(tag)) {
            return;
        }

        // Autocomplete if one option remains
        let tagToSet = undefined;
        if (filteredTagList?.length === 1) {
            tagToSet = filteredTagList.at(0);
            setSearchString("");
        }
        // Otherwise, if possible select a tag from the available list
        if (filteredTagList?.includes(tag)) {
            tagToSet = tag;
        }

        if (tagToSet || !subjectsOnly) {
            update({
                ...doc,
                // We do not need to add subjects in the subjectsOnly case
                tags: [...doc.tags ?? [], tagToSet ?? tag],
            });
        }

        if (tag === searchString) {
            setSearchString("");
            inputRef.current?.focus();
        }
    }

    function removeTag(tagToRemove: string) {
        const tags = doc.tags?.filter(tag => tag !== tagToRemove);
        update({...doc, tags});
    }

    function onKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            addTag(searchString);
            e.preventDefault();
        }
    }

    return <div className={styles.wrapper}>
        {doc.tags?.map(tag => <Button key={tag} outline onClick={() => removeTag(tag)}>{tag} ➖</Button>)}
        <Input value={searchString}
            onChange={(e) => setSearchString(e.target.value.toLowerCase())}
            placeholder={`Type to add ${subjectsOnly ? "subjects" : "tags"}...`}
            innerRef={inputRef}
            onKeyPress={onKeyPress}
        />
        {searchString !== "" && <div>
            <Button onClick={() => setShowTagList(!showTagList)}>
                {showTagList ? 
                    `Hide ${subjectsOnly ? "subjects" : "tags"}` :
                    `Show available ${subjectsOnly ? "subjects" : "tags"}`}
            </Button>
            {showTagList && (filteredTagList?.map((tag) =>
                <Button key={tag} outline color="primary" onClick={() => addTag(tag)}>{tag} ➕</Button>
            ) ?? <em>Loading...</em>)}
            {!subjectsOnly && // Don't allow the addition of new subjects if it is subjectsOnly
                <Button color="success" onClick={() => addTag(searchString)}>Create new tag: {searchString} ➕</Button>}
        </div>}
    </div>;
}
