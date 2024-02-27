import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";

import { Box } from "./SemanticItem";
import { InsertButton, InserterProps } from "./presenters/ListChildrenPresenter";
import styles from "./styles/semantic.module.css";
import { generate } from "../../utils/keyedListHook";

const blockTypes = {
  content: { type: "content", encoding: "markdown", value: "" },
  "code snippet": {
    type: "codeSnippet",
    language: "pseudocode",
    code: "",
    disableHighlighting: false,
  },
  question: {
    type: "isaacQuestion",
    encoding: "markdown",
    id: generate,
    choices: [],
    answer: { type: "content", encoding: "markdown", value: "" },
    // FIXME replace with `value: ""` if and when value snapshotting is implemented
    children: [{ type: "content", encoding: "markdown", value: "" }],
  },
  "glossary term": {
    type: "glossaryTerm",
    encoding: "markdown",
    tags: [],
    explanation: {
      type: "content",
      value: "",
      encoding: "markdown",
    },
  },
  figure: { type: "figure", encoding: "markdown", value: "" },
  image: { type: "image", encoding: "markdown", value: "" },
  video: { type: "video", encoding: "markdown", src: "https://www.youtube.com/watch?v=<video_id>" },
  tabs: { type: "content", layout: "tabs", encoding: "markdown", children: [] },
  accordion: { type: "content", layout: "accordion", encoding: "markdown", children: [] },
  "side-by-side layout": { type: "content", layout: "horizontal", encoding: "markdown", children: [] },
  callout: { type: "content", layout: "callout", encoding: "markdown", value: "" },
  "card deck": { type: "isaacCardDeck", encoding: "markdown", value: "" },
};

export function Inserter({ insert, forceOpen, position }: InserterProps) {
  const [isInserting, setInserting] = useState(false);

  const isOpen = forceOpen || isInserting;
  const onDelete = useMemo(() => (forceOpen ? undefined : () => setInserting(false)), [forceOpen]);
  return isOpen ? (
    <Box name="?" onDelete={onDelete} className={styles.inserterBox}>
      <div className={styles.wrapper}>
        Please choose a block type:
        <br />
        {Object.entries(blockTypes).map(([name, empty]) => (
          <Button
            key={name}
            color="link"
            onClick={() => {
              insert(position, { ...empty });
              setInserting(false);
            }}
          >
            {name}
          </Button>
        ))}
      </div>
    </Box>
  ) : (
    <InsertButton onClick={() => setInserting(true)} />
  );
}
