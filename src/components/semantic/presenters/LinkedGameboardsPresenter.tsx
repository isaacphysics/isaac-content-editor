import React, { useState } from "react";
import useSWR from "swr";

import { IsaacTopicSummaryPage } from "../../../isaac-data-types";
import { liveFetcher } from "../../../services/isaacApi";

import { PresenterProps } from "../registry";
import { Button, Input } from "reactstrap";

import styles from "../styles/tags.module.css";

export function LinkedGameboardsPresenter({doc, update}: PresenterProps<IsaacTopicSummaryPage>) {
    const [gameboardId, setGameboardId] = useState("");

    const {data: gameboard, error} = useSWR<{id: string; questions: unknown; tags: string[]}>(
        gameboardId !== "" ? "gameboards/" + encodeURIComponent(gameboardId) : null,
        liveFetcher,
    );

    function addGameboard(id: string) {
        if (doc.linkedGameboards?.includes(id)) {
            return;
        }
        update({
            ...doc,
            linkedGameboards: [...doc.linkedGameboards ?? [], id],
        });
    }

    function removeGameboard(idToRemove: string) {
        const linkedGameboards = doc.linkedGameboards?.filter(id => id !== idToRemove);
        update({...doc, linkedGameboards});
    }

    return <div className={styles.wrapper}>
        {doc.linkedGameboards?.map(id => <Button key={id} outline onClick={() => removeGameboard(id)}>{id} ➖</Button>)}
        <Input value={gameboardId}
            onChange={(e) => setGameboardId(e.target.value)}
            placeholder="Type to add related content..."
        />
        {gameboardId !== "" && <div>
            <Button outline
                color={error ? "danger" : (gameboard && gameboard.questions) ? "success" : "primary"}
                className={styles.gameboardButton}
                onClick={() => addGameboard(gameboardId)}>
                Id: {gameboardId}  ➕<br />
                Tags: {
                    error ? "gameboard not found"
                        : !gameboard ? "Loading..."
                            : gameboard.tags.length === 0 ? "No Tags!"
                                : gameboard.tags.join(", ")
                }
            </Button>
        </div>}
    </div>;
}
