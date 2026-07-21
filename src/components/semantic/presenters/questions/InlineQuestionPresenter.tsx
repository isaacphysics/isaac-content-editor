import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PresenterProps } from "../../registry";
import { Content, IsaacInlinePart, IsaacInlineQuestion, PositionableFigureRegionProps } from "../../../../isaac-data-types";
import { AnswerPresenter, QuestionTypeSelector } from "./questionPresenters";
import { QUESTION_TYPES } from "../../../../services/constants";
import { EditableIDProp, EditableTitleProp } from "../../props/EditableDocProp";
import { ContentValueOrChildrenPresenter } from "../ContentValueOrChildrenPresenter";
import { Box } from "../../SemanticItem";
import { ListPresenterProp } from "../../props/listProps";
import { InserterProps } from "../ListChildrenPresenter";
import { inlineQuestionRegex } from "../../../../isaac/IsaacTypes";
import { extractValueOrChildrenText } from "../../../../utils/content";
import { SemanticDocProp } from "../../props/SemanticDocProp";
import { ChoicesPresenter } from "../ChoicesPresenter";
import { MultipleChoiceQuestionPresenter } from "./MultipleChoiceQuestionPresenter";
import { Button } from "reactstrap";
import styles from "../../styles/question.module.css";
import { NumericQuestionPresenter } from "./NumericQuestionPresenter";

export type INLINE_TYPES = Extract<QUESTION_TYPES,
    "isaacStringMatchQuestion"
    | "isaacNumericQuestion"
    | "isaacMultiChoiceQuestion"
    | "isaacRegexMatchQuestion"
>;

function Instructions() {
    return <div className="my-2">
        Enter the question above, using the <code>Add inline question part</code> button to add a new question part at your cursor position in the content.
        Alternatively, you can add an inline question part manually (see below). 
        <details>
            <summary>Manual instructions</summary>
            First, represent any inline question part in the content with <code>[inline-question:id]</code>. 
            Then, add a new inline question part below, setting the question ID to be <code>inline-question:id</code> (without the square brackets!). 
            These will then link automatically.
        </details>
    </div>;
}

export function InlinePartsPresenter(props: PresenterProps<IsaacInlineQuestion>) {
    return <Box name="Inline Parts">
        <Instructions />
        <ListPresenterProp {...props}
            prop="inlineQuestions"
            childTypeOverride="inlineQuestionPart"
        />
    </Box>;
}

export const EditableInlineTypeProp = (props: PresenterProps<Content> & {disabled? : boolean}) => {
    const {doc, update, disabled} = props;

    const inlineQuestionTypes: Record<INLINE_TYPES, string> = {
        isaacStringMatchQuestion: "String Match Question",
        isaacNumericQuestion: "Numeric Question",
        isaacMultiChoiceQuestion: "Multiple Choice Question",
        isaacRegexMatchQuestion: "Regex Match Question",
    };

    if (doc.type === "inlineQuestionPart") {
        const newDoc = {...doc, type: "isaacStringMatchQuestion"};
        update(newDoc);
        return QuestionTypeSelector({doc: newDoc, update, questionTypes: inlineQuestionTypes, disabled});
    }

    return QuestionTypeSelector({doc, update, questionTypes: inlineQuestionTypes, disabled});
};

export function InlinePartInserter({insert, insertMultiple, position, collection, lengthOfCollection}: InserterProps) {
    const inlineContext = useContext(InlineQuestionContext);
    
    const addPart = useCallback((idSuffix: string | undefined) => {
        const id = idSuffix ? `inline-question:${idSuffix}` : undefined;
        insert(position, {type: "inlineQuestionPart", choices: [], id: id} as IsaacInlinePart);
    }, [insert, position]);

    inlineContext.addPart = addPart;

    const addMultipleParts = useCallback((ids: string[]) => {
        // note that ids must be genuine strings, as there may only exist one undefined part
        insertMultiple(ids.map((id, index) => [position + index, {type: "inlineQuestionPart", choices: [], id: `inline-question:${id}`} as IsaacInlinePart]));
    }, [insertMultiple, position]);

    const calculatedPartsFromContent = [
        ...(inlineContext.textContent ? inlineContext.textContent.matchAll(inlineQuestionRegex).map(match => match.groups?.id as string) : []),
        ...(inlineContext.figureMap ? Object.values(inlineContext.figureMap).map(pdzp => pdzp.map(dz => dz.id)).flat() : []),
    ];
    const unusedParts = calculatedPartsFromContent.filter(id => id && !(collection?.map(part => part.id ? part.id.slice("inline-question:".length) : undefined)?.includes(id)));

    if (position !== lengthOfCollection) {
        return null; // Only include an insert button at the end.
    }

    return <div className={styles.inlineItemsChoiceInserter}>
        <Button color="primary" onClick={() => addMultipleParts(unusedParts)} disabled={lengthOfCollection === calculatedPartsFromContent.length}>Detect and add missing inline regions</Button>
        <Button color="secondary" onClick={() => addPart(undefined)} disabled={collection?.some(part => part.id === undefined)}>Add new inline question part</Button>
    </div>;
}

const getInlineQuestionPresenter = (type: INLINE_TYPES, props: PresenterProps<IsaacInlinePart>) : Exclude<React.ReactNode, undefined> => {
    switch (type) {
        case "isaacNumericQuestion":
            return <>
                <hr/>
                <NumericQuestionPresenter {...props} showMeta={false} />
            </>;
        case "isaacMultiChoiceQuestion":
            return <>
                <hr/>
                <MultipleChoiceQuestionPresenter {...props} showMeta={false} />
            </>;
        case "isaacRegexMatchQuestion":
        case "isaacStringMatchQuestion":
            return null;
    }
};

export function InlineQuestionPartPresenter(props: PresenterProps<IsaacInlinePart>) {
    const [isDisabled, setIsDisabled] = useState(false);
    const choices = <ChoicesPresenter {...props} />;
    
    useEffect(() => {
        setIsDisabled(choices.props.doc.choices && choices.props.doc.choices.length > 0);
    }, [choices.props.doc.choices]);

    return <>
        <h4><EditableTitleProp {...props} placeHolder="Question part title"/></h4>
        <h6><EditableIDProp {...props} label="Question ID"/></h6>
        {props.doc.id && props.doc.id.match(/^\[|\]$/) && <p className="text-danger"><i>Warning: the ID should not include the surrounding square brackets!</i></p>}
        <EditableInlineTypeProp {...props} disabled={isDisabled} />
        <em>Note: you cannot change the question type if any choices exist.</em>
        {props.doc.type && getInlineQuestionPresenter(props.doc.type as INLINE_TYPES, props)}
        {choices}
        <SemanticDocProp {...props} prop="defaultFeedback" name="Default Feedback" />
        <AnswerPresenter {...props} />
    </>;
}

export const InlineQuestionContext = createContext<{
    isInlineQuestion?: boolean,
    addPart?: (id: string) => void,
    figureMap?: {[figureId: string]: PositionableFigureRegionProps[]}
    setFigureMap?: React.Dispatch<React.SetStateAction<{[figureId: string]: PositionableFigureRegionProps[]}>>,
    textContent?: string;
}>({});

export function InlineRegionPresenter(props: PresenterProps<IsaacInlineQuestion>) {
    const [figureMap, setFigureMap] = useState<{[figureId: string]: PositionableFigureRegionProps[]}>({});
    const textContent = extractValueOrChildrenText(props.doc);
    return <InlineQuestionContext.Provider value={{isInlineQuestion: true, figureMap, setFigureMap, textContent}}>
        <h6><EditableIDProp {...props} label="Question ID"/></h6>
        <ContentValueOrChildrenPresenter {...props} />
        <InlinePartsPresenter {...props} />
    </InlineQuestionContext.Provider>;
}
