import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row} from "reactstrap";

import {
    Content,
    IsaacClozeQuestion,
    IsaacItemQuestion,
    IsaacParsonsQuestion,
    IsaacReorderQuestion,
    Item,
    ParsonsItem
} from "../../../isaac-data-types";

import {EditableAltTextProp, EditableIDProp, EditableValueProp} from "../props/EditableDocProp";
import {QuestionContext, QuestionFooterPresenter} from "./questionPresenters";
import {InserterProps} from "./ListChildrenPresenter";
import {PresenterProps} from "../registry";
import {CheckboxDocProp} from "../props/CheckboxDocProp";
import {ListPresenterProp} from "../props/listProps";
import {ContentValueOrChildrenPresenter} from "./ContentValueOrChildrenPresenter";
import {MetaItemPresenter, MetaOptions} from "../Metadata";

import styles from "../styles/question.module.css";
import {Box} from "../SemanticItem";
import {ExpandableText} from "../ExpandableText";
import {extractDropZoneCountPerFigure, extractFigureDropZoneStartIndex, extractValueOrChildrenText} from "../../../utils/content";
import {dropZoneRegex, NULL_CLOZE_ITEM, NULL_CLOZE_ITEM_ID} from "../../../isaac/IsaacTypes";
import { PositionableDropZoneProps } from "../../FigureDropZoneModal";

interface ItemsContextType {
    items: ParsonsItem[] | undefined;
    remainingItems: ParsonsItem[] | undefined;
    withReplacement: boolean | undefined;
    allowSubsetMatch: boolean | undefined;
}

export const ItemsContext = createContext<ItemsContextType>(
    {items: undefined, remainingItems: undefined, withReplacement: undefined, allowSubsetMatch: undefined}
);
export const ClozeQuestionContext = createContext<{
    isClozeQuestion: boolean, 
    dropZoneCount?: number, 
    figureMap: {[id: string]: [dropZones: PositionableDropZoneProps[], setDropZones: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>]}, 
    calculateDZIndexFromFigureId: (id: string) => number}
>({
    isClozeQuestion: false,
    figureMap: {},
    calculateDZIndexFromFigureId: (id: string) => 0,
});

function isParsonsQuestion(doc: Content | null | undefined): doc is IsaacParsonsQuestion {
    return doc?.type === "isaacParsonsQuestion";
}

function isClozeQuestion(doc: Content | null | undefined): doc is IsaacClozeQuestion {
    return doc?.type === "isaacClozeQuestion";
}

export function ItemQuestionPresenter(props: PresenterProps<IsaacItemQuestion | IsaacReorderQuestion | IsaacParsonsQuestion | IsaacClozeQuestion>) {
    const {doc, update} = props;

    // Logic to count cloze question drop zones (if necessary) on initial presenter render and doc update
    const [dropZoneCount, setDropZoneCount] = useState<number>();
    const figureMap = useRef<{[id: string]: [dropZones: PositionableDropZoneProps[], setDropZones: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>]}>({});
    const countDropZonesIn = (doc: IsaacItemQuestion | IsaacReorderQuestion | IsaacParsonsQuestion | IsaacClozeQuestion) => {
        if (!isClozeQuestion(doc)) return;
        const questionExposition = extractValueOrChildrenText(doc);
        const figureZonesCount = extractDropZoneCountPerFigure(doc);
        setDropZoneCount((questionExposition.match(dropZoneRegex)?.length ?? 0) + figureZonesCount.map(x => x[1]).reduce((a, b) => a + b, 0));
    };
    const updateWithDropZoneCount = (newDoc: IsaacItemQuestion | IsaacReorderQuestion | IsaacParsonsQuestion | IsaacClozeQuestion, invertible?: boolean) => {
        update(newDoc, invertible);
        countDropZonesIn(newDoc);
    };
    useEffect(() => {
        countDropZonesIn(doc);
    }, []);

    useEffect(() => {
        const f = async () => {
            // if the number of drop zones has changed, the indexes of figure zones may need to change.
            const figures = Array.from(Object.entries(figureMap.current))
            for (const figure of figures) {
                const [id, [dropZones, setDropZones]] = figure;
                const startIndex = extractFigureDropZoneStartIndex(doc, id);
                console.log(id, "starting at", startIndex, dropZones);
                setDropZones(dropZones.map((dz, i) => ({...dz, index: startIndex + i})));
                await new Promise(resolve => setTimeout(resolve, 50));
                console.log("Updated figure", dropZones.map((dz, i) => ({...dz, index: startIndex + i})));
            }
        }
        f();
    }, [dropZoneCount]);

    return <ClozeQuestionContext.Provider value={{
        isClozeQuestion: isClozeQuestion(doc), 
        dropZoneCount,
        figureMap: figureMap.current,
        calculateDZIndexFromFigureId: (id) => extractFigureDropZoneStartIndex(doc, id),
    }}>
        {isParsonsQuestion(doc) && <div><CheckboxDocProp doc={doc} update={update} prop="disableIndentation" label="Disable indentation" /></div>}
        {isClozeQuestion(doc) && <div><CheckboxDocProp doc={doc} update={update} prop="withReplacement" label="Allow items to be used more than once" /></div>}
        {isClozeQuestion(doc) && <div><CheckboxDocProp doc={doc} update={update} prop="detailedItemFeedback" label="Indicate which items are incorrect in question feedback" /></div>}
        <div><CheckboxDocProp doc={doc} update={update} prop="randomiseItems" label="Randomise items on question load" checkedIfUndefined={true} /></div>
        <ContentValueOrChildrenPresenter {...props} update={updateWithDropZoneCount} topLevel />
        {isClozeQuestion(doc) && <ClozeQuestionInstructions />}
        <Box name="Items">
            <Row className={styles.itemsHeaderRow}>
                <Col xs={3} className={styles.center}>
                    ID
                </Col>
                <Col xs={8} className={styles.center}>
                    Value
                </Col>
            </Row>
            <ListPresenterProp {...props} prop="items" childTypeOverride={isParsonsQuestion(doc) ? "parsonsItem" : "item"} />
        </Box>
        <ItemsContext.Provider value={{
            items: doc.items,
            remainingItems: undefined,
            withReplacement: isClozeQuestion(doc) && doc.withReplacement,
            allowSubsetMatch: undefined,
        }}>
            <QuestionFooterPresenter {...props} />
        </ItemsContext.Provider>
    </ClozeQuestionContext.Provider>;
}

export function ItemPresenter(props: PresenterProps<Item>) {
    const doc = useContext(QuestionContext);
    return <div>
        <Row>
            <Col xs={3}>
                <EditableIDProp {...props} />
            </Col>
            <Col xs={8}>
                <EditableValueProp {...props} multiLine />
            </Col>
        </Row>
        {isClozeQuestion(doc) && <Row>
            <Col xs={8} className={"offset-3"}>
                <EditableAltTextProp {...props} multiLine />
            </Col>
        </Row>}
    </div>;
}

function ItemRow({item}: {item: Item}) {
    return item.id === NULL_CLOZE_ITEM_ID
        ? <>Any item</>
        : <Row>
            <Col xs={3}>
                {item.id}
            </Col>
            <Col xs={9} className={styles.itemRowText}>
                <ExpandableText text={item.value}/>
            </Col>
        </Row>;
}

// Resuse the MetaItemPresenter as it gives a live editable view
const indentationOptions: MetaOptions = {type: "number", hasWarning: (value) => {
    const num = value as number;
    if (isNaN(num) || num < 0 || num > 3) {
        return "Outside 0–3";
    }
}};

export function ItemChoicePresenter(props: PresenterProps<ParsonsItem>) {
    const {doc, update} = props;
    const [isOpen, setOpen] = useState(false);
    const {items, remainingItems, allowSubsetMatch} = useContext(ItemsContext);
    const {isClozeQuestion} = useContext(ClozeQuestionContext);

    const item = items?.find((item) => item.id === doc.id) ?? {
        id: doc.id,
        value: "Unknown item",
    };
    const staticItems = isClozeQuestion && allowSubsetMatch && item.id !== NULL_CLOZE_ITEM_ID ? [NULL_CLOZE_ITEM] : [];

    const dropdown = <Dropdown toggle={() => setOpen(toggle => !toggle)}
                               isOpen={isOpen}>
        <DropdownToggle outline className={styles.dropdownButton}>
            <ItemRow item={item} />
        </DropdownToggle>
        <DropdownMenu className={styles.itemChoiceDropdown}>
            <DropdownItem key={item.id} className={styles.dropdownItem} active>
                <ItemRow item={item} />
            </DropdownItem>
            {remainingItems?.concat(staticItems).map((i) => {
                return <DropdownItem key={i.id} className={styles.dropdownItem} onClick={() => {
                    update({
                        ...doc,
                        id: i.id,
                    });
                }}>
                    <ItemRow item={i} />
                </DropdownItem>;
            })}
        </DropdownMenu>
    </Dropdown>;

    if (doc.type === "parsonsItem") {
        return <div className={styles.parsonsItem}
                    style={{borderLeftWidth: `calc(1px + ${(doc.indentation ?? 0) * 1.5}em)`}}>
            {dropdown}
            <span className={styles.parsonsIndentPresenter}>
                <MetaItemPresenter {...props} prop="indentation" name="Indent"
                                   options={indentationOptions} />
            </span>
        </div>;
    } else {
        return <div className={styles.itemsChoiceRow}>
            {dropdown}
        </div>;
    }
}

export function ItemChoiceItemInserter({insert, position, lengthOfCollection}: InserterProps) {
    const {items, remainingItems} = useContext(ItemsContext);
    const {dropZoneCount, isClozeQuestion} = useContext(ClozeQuestionContext);

    if (!items || !remainingItems) {
        return null; // Shouldn't happen.
    }

    if (position !== lengthOfCollection) {
        return null; // Only include an insert button at the end.
    }
    const item = isClozeQuestion ? NULL_CLOZE_ITEM : remainingItems[0];
    if (!item || (isClozeQuestion && (!dropZoneCount || lengthOfCollection >= dropZoneCount))) {
        return null; // No items remaining, or max items reached in choice (in case of cloze question)
    }
    return <Button className={styles.itemsChoiceInserter} color="primary" onClick={() => {
        const newItem: ParsonsItem = {type: item.type, id: item.id};
        if (newItem.type === "parsonsItem") {
            newItem.indentation = 0;
        }
        insert(position, newItem);
    }}>Add</Button>;
}

export function ClozeQuestionInstructions() {
    return <>
        <h3>Defining drop zones</h3>
        <p>To place drop zones within question text, either use the helper button provided, or write <code>[drop-zone]</code> (with the square brackets) - this will then get replaced with a drop zone UI element when the question is rendered. If you want to place drop zones within LaTeX, escape it with the <code>\text</code> environment (but see disclaimer)</p>
        <p>For the drop zones to work correctly, the question exposition must be <b>markdown encoded</b>. This should happen by default.</p>
        <p><small>Disclaimer: drop zones will work in LaTeX for simple use cases, but for very complex and/or nested equations may not work as intended - in summary drop zones in LaTeX are not explicitly supported by us, but it can work for <em>most</em> use cases</small></p>
    </>;
}
