import React, { useState } from "react";
import { Button, Input } from "reactstrap";
import useSWR from "swr";

import { Content } from "../../../isaac-data-types";
import { stagingFetcher } from "../../../services/isaacApi";

import { PresenterProps } from "../registry";

import styles from "../styles/tags.module.css";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

function readableContentType(type: string | undefined) {
  switch (type) {
    case "isaacQuestionPage":
      return "Question";
    case "isaacConceptPage":
      return "Concept";
    case "isaacTopicSummaryPage":
      return "TopicSummary";
    default:
      return type;
  }
}

function ContentDescription({ content }: { content: Content }) {
  return (
    <>
      {content.title} ({readableContentType(content.type)})
      <br />
      <small>{content.id}</small>
    </>
  );
}

export function RelatedContentPresenter({ doc, update }: PresenterProps) {
  const [searchString, setSearchString] = useState("");

  const { data: relatedContent } = useSWR<{ results: Content[] }>(
    searchString !== ""
      ? "search?query=" + encodeURIComponent(searchString) + "&types=isaacConceptPage,isaacQuestionPage"
      : null,
    stagingFetcher,
  );

  function addRelatedContent(id: string) {
    if (doc.relatedContent?.includes(id)) {
      return;
    }
    update({
      ...doc,
      relatedContent: [...(doc.relatedContent ?? []), id],
    });
  }

  function removeRelatedContent(idToRemove: string) {
    const relatedContent = doc.relatedContent?.filter((id) => id !== idToRemove);
    update({ ...doc, relatedContent });
  }

  return (
    <div className={styles.wrapper}>
      {doc.relatedContent && (
        <DragDropContext
          onDragEnd={(result) => {
            if (doc.relatedContent && result.destination) {
              const reorderedRelatedContent = Array.from(doc.relatedContent);
              const [removed] = reorderedRelatedContent.splice(result.source.index, 1);
              reorderedRelatedContent.splice(result.destination.index, 0, removed);
              update({ ...doc, relatedContent: reorderedRelatedContent });
            }
          }}
        >
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="d-flex flex-wrap"
                style={{ backgroundColor: snapshot.isDraggingOver ? "lightblue" : "transparent" }}
              >
                {doc.relatedContent?.map((id, index) => (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                        className="btn btn-outline-secondary mr-3"
                      >
                        𓃑
                        <span className="ml-2">{id}</span>
                        <button className="bg-transparent border-0 m-0 pr-0" onClick={() => removeRelatedContent(id)}>
                          ➖
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Input
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder="Type to add related content..."
      />
      {searchString !== "" && (
        <div>
          {relatedContent?.results?.map((content) => {
            if (!content.id) return null;
            if (doc.relatedContent?.includes(content.id)) {
              return null;
            }
            return (
              <Button
                key={content.id}
                outline
                color={content.type === "isaacQuestionPage" ? "success" : "primary"}
                onClick={() => addRelatedContent(content.id as string)}
              >
                <ContentDescription content={content} /> ➕
              </Button>
            );
          }) ?? <em>Loading...</em>}
        </div>
      )}
    </div>
  );
}
