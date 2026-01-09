import React, { useMemo, useState } from "react";
import { Button, Dropdown, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

import { Box } from "./SemanticItem";
import { InsertButton, InserterProps } from "./presenters/ListChildrenPresenter";
import styles from "./styles/semantic.module.css";
import { generate } from "../../utils/keyedListHook";
import { Content } from "../../isaac-data-types";

const defaultBlockTypes = {
    "content": {type: "content", encoding: "markdown", value: ""},
    "question": {
        type: "isaacQuestion",
        encoding: "markdown",
        id: generate,
        choices: [],
        answer: {type: "content", encoding: "markdown", value: ""},
        // FIXME replace with `value: ""` if and when value snapshotting is implemented
        children: [{type: "content", encoding: "markdown", value: ""}]
    },
    "glossary term": {
        type: "glossaryTerm",
        encoding: "markdown",
        tags: [],
        explanation: {
            "type": "content",
            "value": "",
            "encoding": "markdown"
        },
    },
    "figure": {type: "figure", encoding: "markdown", value: ""},
    "image": {type: "image", encoding: "markdown", value: ""},
    "video": {type: "video", encoding: "markdown", src: "https://www.youtube.com/watch?v=<video_id>"},
    "tabs": {type: "content", layout: "tabs", encoding: "markdown", children: []},
    "code tabs": {type: "codeTabs", encoding: "markdown", children: []},
    "accordion": {type: "content", layout: "accordion", encoding: "markdown", children: []},
    "side-by-side layout": {type: "content", layout: "horizontal", encoding: "markdown", children: []},
    "external app embed": [
        {name: "desmos", type: "desmosEmbedding", encoding: "markdown", value: ""}, 
        {name: "geogebra", type: "geogebraEmbedding", encoding: "markdown", value: ""}
    ],
    "clearfix": {type: "content", layout: "clearfix", encoding: "markdown", value: ""},
    "callout": {type: "content", layout: "callout", encoding: "markdown", value: "", subtitle: "regular"},
    "inline region": {type: "isaacInlineRegion", encoding: "markdown", id: generate, children: [], inlineQuestions: []},
    "card deck": {type: "isaacCardDeck", encoding: "markdown", value: ""},
    "code snippet": {
        type: "codeSnippet",
        language: "pseudocode",
        code: "",
        disableHighlighting: false,
    },
    "code snippet (interactive)": {
        type: "interactiveCodeSnippet",
        language: "python",
        code: "",
        disableHighlighting: false,
    }
};

export function Inserter({insert, forceOpen, position, blockTypes = defaultBlockTypes}: InserterProps & {blockTypes?: Record<string, Content | (Content & {name?: string})[]>} ) {
    const [isInserting, setInserting] = useState(false);

    const isOpen = forceOpen || isInserting;
    const onDelete = useMemo(() => forceOpen ? undefined : () => setInserting(false),
        [forceOpen]);
    return isOpen ?
        <Box name="?" onDelete={onDelete} className={styles.inserterBox}>
            <div className={styles.wrapper}>
                Please choose a block type:
                <br />
                {blockTypes && Object.entries(blockTypes).map(([name, empty]) => {
                    {/* TODO remove pr-0 and text-left after BS5 upgrade :) */}
                    if (Array.isArray(empty)) {
                        return <UncontrolledDropdown key={name} tag={"span"} className={styles.inserterDropdown}>
                            <DropdownToggle caret tag="span">
                                <Button className="pr-0 pe-0" color="link" caret> 
                                    {name}
                                </Button>
                            </DropdownToggle>
                            <DropdownMenu container={"root"}>
                                <div className={styles.inserterDropdownMenu}>
                                    {empty.map((option) => {
                                        const {name: embedName, ...rest} = option;
                                        return <Button key={embedName} color="link" className="w-100 text-left text-start px-4" onClick={() => {
                                            insert(position, {...rest});
                                            setInserting(false);
                                        }}>
                                            {option.name}
                                        </Button>
                                    })}
                                </div>
                            </DropdownMenu>
                        </UncontrolledDropdown>;
                    } else {
                        return <Button key={name} color="link" onClick={() => {
                            insert(position, {...empty});
                            setInserting(false);
                        }}>
                        {name}
                    </Button>
                    }
                })}
            </div>
        </Box>
        :
        <InsertButton onClick={() => setInserting(true)}/>;
}
