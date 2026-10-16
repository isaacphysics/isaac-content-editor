import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { GlossaryTerm } from "../../../isaac-data-types";

import { PresenterProps } from "../registry";

import styles from "../styles/tags.module.css";
import { STAGES_CS, STAGES_SCI } from "../../../services/constants";
import { siteSpecific } from "../../../services/site";

export function StagePresenter({doc, update}: PresenterProps<GlossaryTerm>) {
    const [searchString, setSearchString] = useState("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [showStageList, setShowStageList] = useState(true);
    const [filteredStageList, setFilteredStageList] = useState<string[]>();

    useEffect(() => {
        setFilteredStageList(siteSpecific(STAGES_SCI, STAGES_CS)?.filter(stage => stage.includes(searchString) && !doc.stages?.includes(stage)));
    }, [searchString, doc.stages]);

    function addStage(stage: string) {
        if (doc.stages?.includes(stage)) {
            return;
        }

        // Autocomplete when one option remains
        let stageToSet = undefined;
        if (filteredStageList?.length === 1) {
            stageToSet = filteredStageList.at(0);
            setSearchString("");
        }
        // Otherwise select from available stages
        if (filteredStageList?.includes(stage)) {
            stageToSet = stage;
        }

        if (stageToSet) {
            update({
                ...doc,
                // Only on Ada will `tag` be potentially used
                // this prevents Physics from creating new subjects
                stages: [...doc.stages ?? [], stageToSet],
            });
        }
    }

    function addallStages() {
        const remainingStages = siteSpecific(STAGES_SCI, STAGES_CS).filter(
            stage => !doc.stages?.includes(stage)
        );
        update({
            ...doc,
            stages: [...doc.stages ?? [], ...remainingStages],
        });
    }


    function removeStage(stageToRemove: string) {
        const stages = doc.stages?.filter(stage => stage !== stageToRemove);
        update({...doc, stages: stages});
    }

    function onKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            addStage(searchString);
            e.preventDefault();
        }
    }

    return <div className={styles.wrapper}>
        {doc.stages?.map(stage => <Button key={stage} variant="outline-secondary" onClick={() => removeStage(stage)}>{stage} ➖</Button>)}
        <Form.Control value={searchString}
            onChange={(e) => setSearchString(e.target.value.toLowerCase())}
            placeholder="Type to add stages..."
            innerRef={inputRef}
            onKeyPress={onKeyPress}
        />
        {searchString !== "" && <div>
            <Button variant="secondary" onClick={() => setShowStageList(!showStageList)}>
                {showStageList ? "Hide stages" : "Show available stages"}
            </Button>
            {showStageList && (filteredStageList?.map((stage) =>
                <Button key={stage} variant="outline-primary" onClick={() => addStage(stage)}>{stage} ➕</Button>
            ) ?? <em>Loading...</em>)}
            <Button variant="success" onClick={() => addallStages()}>Add all stages ➕</Button>
        </div>}
    </div>;
}
