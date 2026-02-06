import React, {MutableRefObject, useContext, useEffect, useRef, useState,} from "react";
import {Alert, Button, Input, Label} from "reactstrap";
import {InputType} from "reactstrap/lib/Input";

import {
    ChemicalFormula,
    Choice,
    CoordinateChoice, CoordinateItem,
    DndChoice,
    Formula,
    FreeTextRule,
    GraphChoice,
    IsaacNumericQuestion,
    ItemChoice,
    Quantity,
    RegexPattern,
    StringChoice
} from "../../../isaac-data-types";

import {
    BaseValuePresenter,
    buildValuePresenter,
    ValuePresenter,
    ValuePresenterProps,
    ValuePresenterRef,
    ValueWrapper
} from "./BaseValuePresenter";
import {SemanticDocProp} from "../props/SemanticDocProp";
import {CheckboxDocProp} from "../props/CheckboxDocProp";
import {EditableDimensionalDocProp, EditableValueProp} from "../props/EditableDocProp";
import {CHOICE_TYPES} from "../ChoiceInserter";
import {PresenterProps} from "../registry";
import {ListPresenterProp} from "../props/listProps";
import {DropZoneQuestionContext, ItemsContext} from "./ItemQuestionPresenter";

import styles from "../styles/choice.module.css";
import {CoordinateQuestionContext, InlineQuestionContext, QuestionContext} from "./questionPresenters";
import {Markup} from "../../../isaac/markup";
import {NULL_CLOZE_ITEM, NULL_CLOZE_ITEM_ID} from "../../../isaac/IsaacTypes";


interface LabeledInputProps<V extends Record<string, string | undefined>> {
    value: MutableRefObject<V | undefined>;
    prop: keyof V;
    label: string;
    className?: string;
    type?: InputType;
    warningFunction?: (inputText: string) => string;
}

function LabeledInput<V extends Record<string, string | undefined>>({value, prop, label, className, type, warningFunction}: LabeledInputProps<V>) {
    const [warning, setWarning] = useState<string>();

    return <Label className={className}>
        {label}
        <Input type={type ?? "text"}
            autoFocus
            defaultValue={value.current?.[prop]}
            onChange={(e) => {
                if (value.current !== undefined) {
                    value.current[prop] = e.target.value as V[keyof V];
                    setWarning(warningFunction ? warningFunction(e.target.value) : "");
                }
            }}
            invalid={!!warning}
        />
        {warning && <div className="text-danger">{warning}</div>}
    </Label>;
}

export const QuantityPresenter = buildValuePresenter(
    function QuantityValue({editing, doc, value}) {
        const parentQuestionDoc = useContext(QuestionContext);
        const displayUnit = parentQuestionDoc?.type === "isaacNumericQuestion" && (parentQuestionDoc as IsaacNumericQuestion).displayUnit;
        if (!editing) {
            if (doc.value === undefined || doc.value === "") {
                return <em>{`Enter value${displayUnit ? "" : " and units"} here`}</em>;
            }

            const unit = displayUnit || doc.units || "";
            const html = "$\\quantity{" + (doc.value || "") + "}{" + unit + "}$";
            return <Markup trusted-markup-encoding="markdown">{html}</Markup>;
        } else {
            return <>
                <LabeledInput value={value} prop="value" label="Quantity" />
                {displayUnit ?
                    <Markup trusted-markup-encoding="markdown">{"$" + displayUnit + "$"}</Markup> :
                    <LabeledInput value={value} prop="units" label="Units" />}
            </>;
        }
    },
    (doc: Quantity) => ({value: doc.value, units: doc.units}),
    ({value, units}, doc) => ({...doc, value, units}),
);

const hasFiveOrMoreDigits = () => {
    return (inputText: string) => {
        const regex = /\d{5,}/;
        const matches = inputText.match(regex);
        return matches && matches.length > 0 ? "5+ digit numbers are not supported by the symbolic editor: " + matches : "";
    };
};

export const FormulaPresenterInner = buildValuePresenter(
    function FormulaValue({editing, doc, value}) {
        if (!editing) {
            if (doc.value === undefined || doc.value === "") {
                return <div><em>Enter value and python expression here</em></div>;
            } else {
                return <div><Markup trusted-markup-encoding="html">{doc.value}</Markup><code className="text-dark">PYTHON: {doc.pythonExpression}</code></div>;
            }
        } else {
            return <>
                <LabeledInput value={value} prop="value" label="LaTeX formula" className={styles.fullWidth} warningFunction={hasFiveOrMoreDigits()}/>
                <LabeledInput value={value} prop="pythonExpression" label="Python expression" className={styles.fullWidth} />
            </>;
        }
    },
    (doc: Formula) => ({value: doc.value, pythonExpression: doc.pythonExpression}),
    ({value, pythonExpression}, doc) => ({...doc, value, pythonExpression}),
);

const FormulaPresenter = (props: ValuePresenterProps<Formula>) => {
    return <>
        <FormulaPresenterInner {...props}/>
        <CheckboxDocProp {...props} prop="requiresExactMatch" label="Require exact match"/>
    </>;
};

export const ChemicalFormulaPresenter = buildValuePresenter(
    function ChemicalFormulaValue({editing, doc, value}) {
        if (!editing) {
            if (doc.mhchemExpression === undefined || doc.mhchemExpression === "") {
                return <div><em>Enter mhchem formula here</em></div>;
            } else {
                return <Markup trusted-markup-encoding="html">{`$\\ce{${doc.mhchemExpression}}$`}</Markup>;
            }
        } else {
            return <>
                <LabeledInput value={value} prop="mhchemExpression" label="mhchem formula" className={styles.fullWidth} warningFunction={hasFiveOrMoreDigits()}/>
            </>;
        }
    },
    (doc: ChemicalFormula) => ({mhchemExpression: doc.mhchemExpression}),
    ({mhchemExpression}, doc) => ({...doc, mhchemExpression}),
);

export const StringChoicePresenter = (props: ValuePresenterProps<StringChoice>) => {
    const {valueRef, ...rest} = props;

    return <>
        <EditableValueProp {...rest} placeHolder="Enter choice here" ref={valueRef} />
        <br />
        <br />
        <CheckboxDocProp {...rest} prop="caseInsensitive" label="Case insensitive" />
    </>;
};

export const FreeTextRulePresenter = (props: ValuePresenterProps<FreeTextRule>) => {
    const {valueRef, ...rest} = props;

    return <>
        <EditableValueProp {...rest} placeHolder="Matching rule" ref={valueRef} />
        <br />
        <br />
        <CheckboxDocProp {...rest} prop="caseInsensitive" label="Case insensitive" />
        <CheckboxDocProp {...rest} prop="allowsAnyOrder" label="Any order" />
        <CheckboxDocProp {...rest} prop="allowsExtraWords" label="Extra words" />
        <CheckboxDocProp {...rest} prop="allowsMisspelling" label="Misspelling" />
    </>;
};

export const RegexPatternPresenter = (props: ValuePresenterProps<RegexPattern>) => {
    const {valueRef, ...rest} = props;

    const inlineQuestionContext = useContext(InlineQuestionContext);

    function regexHelper() {
        let regex = props.doc.value ?? "";
        if (props.doc.matchWholeString) {
            // Add caret and dollar sign if the whole string should be matched
            regex = "^" + regex + "$";
        }
        const flags = "g" + (props.doc.multiLineRegex ? "m" : "") + (props.doc.caseInsensitive ? "i" : "");
        window.open(`https://regex101.com/?regex=${encodeURIComponent(regex)}&flags=${flags}&delimiter=@&flavor=java`);
    }

    return <>
        <EditableValueProp {...rest} placeHolder="Matching rule" ref={valueRef} />
        <br />
        <CheckboxDocProp {...rest} prop="matchWholeString" label="Entire answer has to match this pattern exactly" />
        <br />
        <CheckboxDocProp {...rest} prop="caseInsensitive" label="Case insensitive" />
        {inlineQuestionContext?.isInlineQuestion
            ? <CheckboxDocProp {...rest} prop="multiLineRegex" label="Multi-line regular expression" disabled checkedIfUndefined={false} />
            : <CheckboxDocProp {...rest} prop="multiLineRegex" label="Multi-line regular expression" />}
        <br />
        <Button onClick={regexHelper}>Test Regex</Button>
    </>;
};

export const GraphChoicePresenter = buildValuePresenter(
    function GraphChoiceValue({editing, doc, value}) {
        if (!editing) {
            if (doc.graphSpec === undefined || doc.graphSpec === "") {
                return <em>Enter graph spec here</em>;
            }

            return <pre>{doc.graphSpec}</pre>;
        } else {
            return <LabeledInput value={value} prop="graphSpec" label="Graph spec" type="textarea" className={styles.graphSpec} />;
        }
    },
    (doc: GraphChoice) => ({graphSpec: doc.graphSpec}),
    ({graphSpec}, doc) => ({...doc, graphSpec}),
);

export const ItemChoicePresenter = (props: ValuePresenterProps<ItemChoice>) => {
    const {items: maybeItems, withReplacement} = useContext(ItemsContext);
    const {isClozeQuestion, dropZoneCount} = useContext(DropZoneQuestionContext);
    const {doc, update} = props;

    const [showClozeChoiceWarning, setShowClozeChoiceWarning] = useState<boolean>(false);

    // An update function that augments the choice with null cloze items in empty spaces if this is a cloze question
    const augmentedUpdate = (newDoc: ItemChoice, invertible?: boolean) => {
        setShowClozeChoiceWarning(false); // This augmented update will always fix the cloze subset match warning
        return update(isClozeQuestion && dropZoneCount
            ? {
                ...newDoc,
                items: Array(dropZoneCount).fill(NULL_CLOZE_ITEM).map((nci, i) => (newDoc?.items && i < newDoc.items.length)
                    ? newDoc.items[i]
                    : nci
                )
            }
            : newDoc
        , invertible);
    };
    // Ensure that the null cloze items are added to the doc initially for a new choice (again only if this is a cloze question)
    useEffect(() => {
        if (isClozeQuestion) {
            if (!doc.items || doc.items.length === 0) {
                augmentedUpdate(doc);
            } else if (doc.items.length !== dropZoneCount) {
                setShowClozeChoiceWarning(true);
            } else {
                setShowClozeChoiceWarning(false);
            }
        }
    }, [dropZoneCount]);

    const items = maybeItems ?? [];
    const remainingItems = withReplacement ? items : items.filter(item => !doc.items?.find(i => i.id === item.id));

    return <>
        {doc.type === "itemChoice" && <CheckboxDocProp {...props} doc={doc} update={props.update} prop="allowSubsetMatch" label="Enable wildcard matching of items (previously called subset matching)" />}
        {doc.type === "itemChoice" && isClozeQuestion && !doc.allowSubsetMatch && doc.items?.find(i => i.id === NULL_CLOZE_ITEM_ID) && <Alert color={"warning"}>
            Please fill in all &quot;Any item&quot; placeholders. If you would like to use wildcard matching, tick the box above.
        </Alert>}
        {doc.type === "itemChoice" && showClozeChoiceWarning && <Alert color={"danger"}>
            In order for cloze questions to work as expected, the choice must be the same length as the number of
            drop zones, and should contain &quot;Any item&quot; placeholders in slots that should be ignored (if using
            wildcard matching).<br/>
            If a choice does not have the same number of items as drop zones, <b>it will not be checked against the
                users answer</b>.
        </Alert>}
        <ItemsContext.Provider value={{items, remainingItems, remainingDropZones: undefined, withReplacement, allowSubsetMatch: doc.allowSubsetMatch, isCorrect: doc.correct}}>
            <ListPresenterProp {...props} doc={doc} update={augmentedUpdate} prop="items" childTypeOverride="item$choice" />
        </ItemsContext.Provider>
    </>;
};

export const DndChoicePresenter = (props: ValuePresenterProps<DndChoice>) => {
    const {doc, update} = props;
    const {items: maybeItems, withReplacement} = useContext(ItemsContext);
    const {dropZoneIds: maybeDropZoneIds} = useContext(DropZoneQuestionContext);

    const items = maybeItems ?? [];
    const remainingItems = withReplacement ? items : items.filter(item => !doc.items?.find(i => i.id === item.id));

    const dropZoneIds = Array.from(maybeDropZoneIds || []);
    const remainingDropZones = dropZoneIds.filter(id => !doc.items?.find(item => item.dropZoneId === id));

    return <>
        <span>Add an entry here to attach one Item to one Drop Zone.</span>
        <ItemsContext.Provider value={{items, remainingItems, remainingDropZones, withReplacement, allowSubsetMatch: undefined, isCorrect: doc.correct}}>
            <ListPresenterProp {...props} doc={doc} update={update} prop="items" childTypeOverride="dndItem$choice" />
        </ItemsContext.Provider>
        {dropZoneIds.length === 0 && <Alert color={"warning"} className="mt-3">
            Add some drop zones to the question before adding choices.
        </Alert>}
    </>;
};

const EditableCoordinatesProp = EditableDimensionalDocProp<CoordinateItem>("coordinates");

export function CoordinateItemPresenter(props: PresenterProps<CoordinateItem>) {
    const numberOfDimensions = useContext(CoordinateQuestionContext).numberOfDimensions;
    return <>{[...Array(numberOfDimensions)].map((_, i) =>
        <div className={"mb-3"} key={i}>
            <EditableCoordinatesProp {...props} dimension={i} label={"Dimension ".concat((i+1).toString())} />
            <div className={styles.questionLabel} />
        </div>)}</>;
}

export const CoordinateChoicePresenter = (props: ValuePresenterProps<CoordinateChoice>) => {
    const numberOfCoordinates = useContext(CoordinateQuestionContext).numberOfCoordinates;
    useEffect(() => {
        if (numberOfCoordinates !== undefined && props.doc.items?.length !== numberOfCoordinates) {
            props.update({...props.doc, items: Array(numberOfCoordinates).fill({coordinates: [], type: "coordinateItem"}).map((placeholder, i) => props.doc.items && props.doc.items[i] ? props.doc.items[i] : placeholder)});
        }
    }, [numberOfCoordinates]);

    return <>
        {<CheckboxDocProp {...props} doc={props.doc} update={props.update} prop="allowSubsetMatch" label="Enable subset matching" />}
        <ListPresenterProp {...props} prop="items" childTypeOverride="coordinateItem$choice" />
    </>;
};

const CHOICE_REGISTRY: Record<CHOICE_TYPES, ValuePresenter<Choice>> = {
    choice: BaseValuePresenter,
    quantity: QuantityPresenter,
    formula: FormulaPresenter,
    chemicalFormula: ChemicalFormulaPresenter,
    stringChoice: StringChoicePresenter,
    freeTextRule: FreeTextRulePresenter,
    logicFormula: FormulaPresenter,
    graphChoice: GraphChoicePresenter,
    regexPattern: RegexPatternPresenter,
    itemChoice: ItemChoicePresenter,
    parsonsChoice: ItemChoicePresenter,
    dndChoice: DndChoicePresenter,
    coordinateChoice: CoordinateChoicePresenter,
};

export function ChoicePresenter(props: PresenterProps<Choice>) {
    const choiceValueRef = useRef<ValuePresenterRef>(null);

    const choice = props.doc;
    const ChoiceValuePresenter = CHOICE_REGISTRY[choice.type as CHOICE_TYPES] ?? BaseValuePresenter;
    return <div className={styles.choice}>
        <Button onClick={() => {
            props.update({
                ...choice,
                correct: !choice.correct,
            });
        }} color={choice.correct ? "success" : "danger"}>
            {choice.correct ? "✓" : "✗"}
        </Button>
        <ValueWrapper className={styles.choiceValue} valueRef={choiceValueRef}>
            <ChoiceValuePresenter {...props} valueRef={choiceValueRef}/>
        </ValueWrapper>
        <div className={styles.choiceExplanation}>
            <SemanticDocProp {...props} prop="explanation" name="Explanation"/>
        </div>
    </div>;
}
