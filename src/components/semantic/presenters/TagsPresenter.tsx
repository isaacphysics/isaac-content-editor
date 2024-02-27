import React, { useEffect, useRef, useState } from "react";
import { Button, Input } from "reactstrap";
import useSWR from "swr";

import { stagingFetcher } from "../../../services/isaacApi";

import { PresenterProps } from "../registry";

import styles from "../styles/tags.module.css";

export function TagsPresenter({ doc, update }: PresenterProps) {
  const [searchString, setSearchString] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { data: tagList } = useSWR<string[]>(searchString !== "" ? "content/tags" : null, stagingFetcher);
  const [showTagList, setShowTagList] = useState(true);
  const [filteredTagList, setFilteredTagList] = useState<string[]>();

  useEffect(() => {
    setFilteredTagList(tagList?.filter((tag) => tag.includes(searchString) && !doc.tags?.includes(tag)));
  }, [searchString, tagList, doc.tags]);

  function addTag(tag: string) {
    if (doc.tags?.includes(tag)) {
      return;
    }
    update({
      ...doc,
      tags: [...(doc.tags ?? []), tag],
    });
    if (tag === searchString) {
      setSearchString("");
      inputRef.current?.focus();
    }
  }

  function removeTag(tagToRemove: string) {
    const tags = doc.tags?.filter((tag) => tag !== tagToRemove);
    update({ ...doc, tags });
  }

  function onKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      addTag(searchString);
      e.preventDefault();
    }
  }

  return (
    <div className={styles.wrapper}>
      {doc.tags?.map((tag) => (
        <Button key={tag} outline onClick={() => removeTag(tag)}>
          {tag} ➖
        </Button>
      ))}
      <Input
        value={searchString}
        onChange={(e) => setSearchString(e.target.value.toLowerCase())}
        placeholder="Type to add tags..."
        innerRef={inputRef}
        onKeyPress={onKeyPress}
      />
      {searchString !== "" && (
        <div>
          <Button onClick={() => setShowTagList(!showTagList)}>
            {showTagList ? "Hide tags" : "Show available tags"}
          </Button>
          {showTagList &&
            (filteredTagList?.map((tag) => (
              <Button key={tag} outline color="primary" onClick={() => addTag(tag)}>
                {tag} ➕
              </Button>
            )) ?? <em>Loading...</em>)}
          <Button color="success" onClick={() => addTag(searchString)}>
            Create new tag: {searchString} ➕
          </Button>
        </div>
      )}
    </div>
  );
}
