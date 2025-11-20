import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {Alert, Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row} from "reactstrap";

import {
    Content,
    DndItem,
    IsaacClozeQuestion,
    IsaacDndQuestion,
    IsaacItemQuestion,
    IsaacParsonsQuestion,
    IsaacReorderQuestion,
    Item,
    ParsonsItem,
    PositionableDropZoneProps
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
import {extractDropZoneIdsPerFigure, extractFigureDropZoneStartIndex, extractValueOrChildrenText} from "../../../utils/content";
import {dndDropZoneRegex, dropZoneRegex, NULL_CLOZE_ITEM, NULL_CLOZE_ITEM_ID, NULL_DND_ITEM, NULL_DND_ITEM_ID} from "../../../isaac/IsaacTypes";

interface ItemsContextType {
    items: Item[] | undefined;
    remainingItems: Item[] | undefined;
    withReplacement: boolean | undefined;
    allowSubsetMatch: boolean | undefined;
}

export const ItemsContext = createContext<ItemsContextType>(
    {items: undefined, remainingItems: undefined, withReplacement: undefined, allowSubsetMatch: undefined}
);
export const DropZoneQuestionContext = createContext<{
    isDndQuestion: boolean,
    isClozeQuestion: boolean,
    dropZoneCount?: number, // legacy option for cloze questions. TODO: remove in favour of dropZoneIds.length
    dropZoneIds?: Set<string>,
    figureMap: {[id: string]: [dropZones: PositionableDropZoneProps[], setDropZones: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>]}, 
    calculateDZIndexFromFigureId: (id: string) => number}
>({
    isDndQuestion: false,
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

function isDndQuestion(doc: Content | null | undefined): doc is IsaacDndQuestion {
    return doc?.type === "isaacDndQuestion";
}

type ItemQuestionType = IsaacItemQuestion | IsaacReorderQuestion | IsaacParsonsQuestion | IsaacClozeQuestion | IsaacDndQuestion;

export function ItemQuestionPresenter(props: PresenterProps<ItemQuestionType>) {
    const {doc, update} = props;

    // Logic to count cloze question drop zones (if necessary) on initial presenter render and doc update
    const [dropZoneCount, setDropZoneCount] = useState<number>();
    const [dropZoneIds, setDropZoneIds] = useState<Set<string>>(new Set());
    const figureMap = useRef<{[id: string]: [dropZones: PositionableDropZoneProps[], setDropZones: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>]}>({});
    const countDropZonesIn = (doc: ItemQuestionType) => {
        if (isClozeQuestion(doc)) {
            const questionExposition = extractValueOrChildrenText(doc);
            setDropZoneCount(questionExposition.match(dropZoneRegex)?.length ?? 0);
        } else if (isDndQuestion(doc)) {
            const questionExposition = extractValueOrChildrenText(doc);
            const figureZoneIds = extractDropZoneIdsPerFigure(doc);
            setDropZoneCount((questionExposition.match(dndDropZoneRegex)?.length ?? 0) + figureZoneIds.map(x => x[1].length).reduce((a, b) => a + b, 0));

            const expositionIds = questionExposition.matchAll(dndDropZoneRegex).filter(x => x.groups?.id).map(x => (x.groups?.id as string)).toArray();
            setDropZoneIds(new Set([...expositionIds, ...figureZoneIds.flatMap(x => x[1])]));
        }
    };
    const updateWithDropZoneCount = (newDoc: ItemQuestionType, invertible?: boolean) => {
        update(newDoc, invertible);
        countDropZonesIn(newDoc);
    };
    useEffect(() => {
        countDropZonesIn(doc);
    }, []);

    useEffect(() => {
        if (isDndQuestion(doc)) {
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
                f();
            }
        }
    }, [dropZoneCount]);

    return <DropZoneQuestionContext.Provider value={{
        isDndQuestion: isDndQuestion(doc),
        isClozeQuestion: isClozeQuestion(doc),
        dropZoneCount,
        dropZoneIds,
        figureMap: figureMap.current,
        calculateDZIndexFromFigureId: (id) => extractFigureDropZoneStartIndex(doc, id),
    }}>
        {isParsonsQuestion(doc) && <div><CheckboxDocProp doc={doc} update={update} prop="disableIndentation" label="Disable indentation" /></div>}
        {(isClozeQuestion(doc) || isDndQuestion(doc)) && <div><CheckboxDocProp doc={doc} update={update} prop="withReplacement" label="Allow items to be used more than once" /></div>}
        {(isClozeQuestion(doc) || isDndQuestion(doc)) && <div><CheckboxDocProp doc={doc} update={update} prop="detailedItemFeedback" label="Indicate which items are incorrect in question feedback" /></div>}
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
            withReplacement: (isClozeQuestion(doc) || isDndQuestion(doc)) && doc.withReplacement,
            allowSubsetMatch: undefined,
        }}>
            <QuestionFooterPresenter {...props} />
        </ItemsContext.Provider>
    </DropZoneQuestionContext.Provider>;
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
    return item.id === NULL_CLOZE_ITEM_ID || item.id === NULL_DND_ITEM_ID
        ? <>Any item</>
        : <Row className="justify-content-center">
            <div className={styles.itemRowText}>
                <ExpandableText text={item.value}/>
                <span className="text-muted ml-3">
                    ({item.id})
                </span>
            </div>
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
    const {isClozeQuestion} = useContext(DropZoneQuestionContext);

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

const DropZoneSelector = (props: PresenterProps<DndItem>) => {
    const {doc, update} = props;
    const {dropZoneIds} = useContext(DropZoneQuestionContext);

    const [isOpen, setOpen] = useState(false);

    return <Dropdown toggle={() => setOpen(toggle => !toggle)} isOpen={isOpen}>
        <DropdownToggle outline className={styles.dropdownButton}>
            <Row>
                Drop zone&nbsp;<b>{doc.dropZoneId}</b>:
            </Row>
        </DropdownToggle>
        <DropdownMenu className={styles.itemChoiceDropdown}>
            {/* TODO: show only unused dropzone ids */}
            {Array.from(dropZoneIds ?? []).map((id) => {
                return <DropdownItem key={id} className={styles.dropdownItem} onClick={() => {
                    update({
                        ...doc,
                        dropZoneId: id,
                    });
                }}>
                    {id}
                </DropdownItem>;
            })}
        </DropdownMenu>
    </Dropdown>;
}

export function DndChoicePresenter(props: PresenterProps<DndItem>) {
    const {doc, update} = props;
    const [isOpen, setOpen] = useState(false);
    const {items, remainingItems, allowSubsetMatch} = useContext(ItemsContext);

    const {dropZoneIds} = useContext(DropZoneQuestionContext);

    const item = items?.find((item) => item.id === doc.id) ?? {
        id: doc.id,
        value: "Unknown item",
    };
    const staticItems = allowSubsetMatch && item.id !== NULL_DND_ITEM_ID ? [NULL_DND_ITEM] : [];

    return <div className={styles.itemsChoiceRow}>
        <DropZoneSelector {...props} />

        {(!doc.dropZoneId || !dropZoneIds?.has(doc.dropZoneId)) && <Alert color="danger">
            {/* Shows if e.g. a dropzone ID has changed */}
            This drop zone ID does not exist.
        </Alert>}
        <Dropdown toggle={() => setOpen(toggle => !toggle)} isOpen={isOpen}>
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
        </Dropdown>
    </div>;
}

export function ItemChoiceItemInserter({insert, position, lengthOfCollection}: InserterProps) {
    const {items, remainingItems} = useContext(ItemsContext);
    const {dropZoneCount, isClozeQuestion} = useContext(DropZoneQuestionContext);

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

export function DndChoiceItemInserter({insert, insertMultiple, position, collection, lengthOfCollection}: InserterProps) {
    const {items, remainingItems} = useContext(ItemsContext);
    const {dropZoneCount, dropZoneIds} = useContext(DropZoneQuestionContext);

    const missingDropZones = dropZoneIds?.difference(new Set(collection?.map((item: DndItem) => item.dropZoneId)));

    if (!items || !remainingItems) {
        return null; // Shouldn't happen.
    }

    if (position !== lengthOfCollection) {
        return null; // Only include an insert button at the end.
    }
    const item = NULL_DND_ITEM;
    if (!item || !dropZoneCount || lengthOfCollection >= dropZoneCount) {
        return null; // No items remaining, or max items reached in choice (in case of cloze question)
    }
    return <>
        <Button className={styles.itemsChoiceInserter} color="primary" onClick={() => {
            const newItem: DndItem = {type: item.type, id: item.id, dropZoneId: item.dropZoneId};
            insert(position, newItem);
        }}>Add blank entry</Button>
        <Button className={styles.itemsChoiceInserter} color="primary" onClick={() => {
            insertMultiple(Array.from(missingDropZones ?? []).map((dropZoneId, index) => {
                const newItem: DndItem = {type: item.type, id: item.id, dropZoneId};
                return [position + index, newItem];
            }));
        }}>Add entries for all missing DZs</Button>
    </>;

}

export function ClozeQuestionInstructions() {
    return <>
        <h3>Defining drop zones</h3>
        <p>To place drop zones within question text, either use the helper button provided, or write <code>[drop-zone]</code> (with the square brackets) - this will then get replaced with a drop zone UI element when the question is rendered. If you want to place drop zones within LaTeX, escape it with the <code>\text</code> environment (but see disclaimer)</p>
        <p>For the drop zones to work correctly, the question exposition must be <b>markdown encoded</b>. This should happen by default.</p>
        <p><small>Disclaimer: drop zones will work in LaTeX for simple use cases, but for very complex and/or nested equations may not work as intended - in summary drop zones in LaTeX are not explicitly supported by us, but it can work for <em>most</em> use cases</small></p>
    </>;
}
