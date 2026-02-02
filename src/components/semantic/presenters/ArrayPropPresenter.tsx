import React, { useState, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Alert, Input, Button } from "reactstrap";
import { ContentBase, Content } from "../../../isaac-data-types";
import { PresenterProps } from "../registry";
import styles from "../styles/tags.module.css";

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

function ContentDescription({content}: { content: Content }) {
    return <>
        {content.title} ({readableContentType(content.type)})
        <br/>
        <small>{content.id}</small>
    </>;
}

export const ArrayPropValueConstraintContext = React.createContext<{
    content: unknown[];
    mapContentToId: (c: any) => string;
    searchString: string;
    setSearchString: React.Dispatch<React.SetStateAction<string>>;
} | undefined>(undefined);

export function ArrayPropPresenter<T extends ContentBase>({doc, update, prop, getChildId=((c) => `${c}`), allowDuplicates=false, calculateButtonProps=(() => ({}))}: PresenterProps<T> & { prop: keyof T, getChildId?: (c: (typeof doc[typeof prop] & any[])[number]) => string, allowDuplicates?: boolean, calculateButtonProps?: (c: (typeof doc[typeof prop] & any[])[number]) => Record<string, unknown>}) {
    const [searchString, setSearchString] = useState("");
    return <ArrayPropValueConstraintContext.Provider value={{searchString, setSearchString, content: [], mapContentToId: (c) => `${c}`}}>
        <ArrayPropPresenterInner doc={doc} update={update} prop={prop} getChildId={getChildId} allowDuplicates={allowDuplicates} calculateButtonProps={calculateButtonProps}/>
    </ArrayPropValueConstraintContext.Provider>;
}

export function ArrayPropPresenterInner<T extends ContentBase>({doc, update, prop, getChildId=((c) => `${c}`), allowDuplicates=false, calculateButtonProps=(() => ({}))}: PresenterProps<T> & { prop: keyof T, getChildId?: (c: (typeof doc[typeof prop] & any[])[number]) => string, allowDuplicates?: boolean, calculateButtonProps?: (c: (typeof doc[typeof prop] & any[])[number]) => Record<string, unknown>}) {
    const context = useContext(ArrayPropValueConstraintContext);

    if (doc[prop] !== undefined && !Array.isArray(doc[prop])) {
        return <Alert color={"warning"}>
            The property <code>{prop.toString()}</code> is not an array, but is expected to be.
        </Alert>;
    }

    if (!context) {
        return <Alert color={"warning"}>
            The <code>{prop.toString()}</code> presenter is missing a context provider. Try wrapping it in an <code>ArrayPropValueConstraintContext</code>.
        </Alert>;
    }
    
    const docProp = (doc[prop] || []) as typeof doc[typeof prop] & unknown[];

    function addItemToArray(id: string) {
        if (!allowDuplicates && docProp.includes(id)) {
            return;
        }
        update({
            ...doc,
            [prop]: [...docProp, id],
        });
    }

    function removeRelatedContent(idToRemove: string) {
        const relatedContent = docProp.filter(id => id !== idToRemove);
        update({
            ...doc, 
            [prop]: relatedContent
        });
    }

    return <div className={styles.wrapper}>
        <DragDropContext onDragEnd={result => {
            if (result.destination) {
                const reorderedDocProp = Array.from(docProp);
                const [removed] = reorderedDocProp.splice(result.source.index, 1);
                reorderedDocProp.splice(result.destination.index, 0, removed);
                update({...doc, [prop]: reorderedDocProp});
            }
        }}>
            <Droppable droppableId="droppable" direction="horizontal">
                {(provided, snapshot) => <div
                    ref={provided.innerRef} {...provided.droppableProps} className="d-flex flex-wrap"
                    style={{backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'transparent'}}
                >
                    {docProp.map((id, index) => <Draggable key={getChildId(id as typeof docProp[number])} draggableId={getChildId(id as typeof docProp[number])} index={index}>
                        {provided => <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            style={provided.draggableProps.style} className="btn btn-outline-secondary me-3"
                        >
                            𓃑
                            <span className="ms-2">{getChildId(id as typeof docProp[number])}</span>
                            <button className="bg-transparent border-0 m-0 pe-0" onClick={() => removeRelatedContent(getChildId(id as typeof docProp[number]))}>➖</button>
                        </div>}
                    </Draggable>)}
                    {provided.placeholder}
                </div>}
            </Droppable>
        </DragDropContext>

        <Input value={context?.searchString} onChange={(e) => context?.setSearchString(e.target.value)}
            placeholder={`Type to add ${String(prop)}...`} className="mt-2"
        />
        {context?.searchString !== "" && <div>
            {context?.content.length ?
                (context?.content?.map((content, index) => {
                    if (!context.mapContentToId(content)) return null;
                    if (!allowDuplicates && docProp.includes(context.mapContentToId(content))) {
                        return null;
                    }
                    return <Button 
                        key={index} outline 
                        onClick={() => addItemToArray(context.mapContentToId(content))}
                        {...calculateButtonProps(content)}
                    >
                        {(content as Content)?.type && <ContentDescription content={content as Content} />}
                        ➕
                    </Button>;
                }) ?? <em>Loading...</em>)
                : <Button 
                    outline onClick={() => {
                        addItemToArray(context.searchString);
                        context.setSearchString("");
                    }}
                    {...calculateButtonProps(context.searchString)}
                >
                    Add {context.searchString} ➕
                </Button>
            }
        </div>}
    </div>;
}
