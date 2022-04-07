import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { SemanticItem } from "./SemanticItem";
import {
    EditableDocPropFor,
    EditableIDProp,
    EditableTitleProp, EditableValueProp,
    NumberDocPropFor
} from "./EditableDocProp";
import styles from "./question.module.css";
import {
    Alert,
    Button, Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row
} from "reactstrap";
import {
    ChoiceQuestion,
    Content,
    IsaacMultiChoiceQuestion,
    IsaacNumericQuestion,
    IsaacParsonsQuestion,
    IsaacQuestionBase,
    IsaacQuickQuestion,
    IsaacStringMatchQuestion,
    IsaacSymbolicQuestion,
    Item, ItemChoice, ParsonsItem,
} from "../../isaac-data-types";
import { SemanticDocProp } from "./SemanticDocProp";
import { EditableText } from "./EditableText";
import { CheckboxDocProp } from "./CheckboxDocProp";
import { CHOICE_TYPES } from "./ChoiceInserter";
import { PresenterProps } from "./registry";
import { useFixedRef } from "../../utils/hooks";
import { ListPresenterProp } from "./ListPresenterProp";
import { BoxedContentValueOrChildrenPresenter } from "./ContentValueOrChildrenPresenter";

export type QUESTION_TYPES =
    | "isaacQuestion"
    | "isaacMultiChoiceQuestion"
    | "isaacNumericQuestion"
    | "isaacSymbolicQuestion"
    | "isaacSymbolicChemistryQuestion"
    | "isaacStringMatchQuestion"
    | "isaacFreeTextQuestion"
    | "isaacSymbolicLogicQuestion"
    | "isaacGraphSketcherQuestion"
    | "isaacRegexMatchQuestion"
    | "isaacItemQuestion"
    | "isaacParsonsQuestion"
;

const QuestionTypes = {
    isaacQuestion: {
        name: "Quick Question",
    },
    isaacMultiChoiceQuestion: {
        name: "Multiple Choice Question",
    },
    isaacNumericQuestion: {
        name: "Numeric Question",
    },
    isaacSymbolicQuestion: {
        name: "Symbolic Question",
    },
    isaacStringMatchQuestion: {
        name: "String Match Question",
    },
    isaacRegexMatchQuestion: {
        name: "Regex Match Question",
    },
    isaacFreeTextQuestion: {
        name: "Free Text Question",
    },
    isaacSymbolicLogicQuestion: {
        name: "Logic Question",
    },
    isaacItemQuestion: {
        name: "Item Question",
    },
    isaacParsonsQuestion: {
        name: "Parsons Question",
    },
    isaacClozeQuestion: {
        name: "Cloze (Drag and Drop) Question",
    },
    isaacSymbolicChemistryQuestion: {
        name: "Chemistry Question",
    },
    isaacGraphSketcherQuestion: {
        name: "Graph Sketcher Question",
    },
};

function QuestionTypeSelector(props: PresenterProps) {
    const [isOpen, setOpen] = useState(false);

    const questionType = QuestionTypes[props.doc.type as QUESTION_TYPES];

    return <Dropdown toggle={() => setOpen(toggle => !toggle)} isOpen={isOpen}>
        <DropdownToggle caret>
            {questionType.name}
        </DropdownToggle>
        <DropdownMenu>
            {Object.keys(QuestionTypes).map((key) => {
                const possibleType = QuestionTypes[key as QUESTION_TYPES];
                return <DropdownItem key={key} active={questionType === possibleType} onClick={() => {
                    if (questionType !== possibleType) {
                        // TODO: fixup question based on changes
                        props.update({
                            ...props.doc,
                            type: key,
                        });
                    }
                }}>
                    {possibleType.name}
                </DropdownItem>;
            })}
        </DropdownMenu>
    </Dropdown>;
}

export function QuestionMetaPresenter(props: PresenterProps) {
    return <div>
        <div className={styles.questionType}>
            <QuestionTypeSelector {...props} />
        </div>
        <h4><EditableTitleProp {...props} placeHolder="Question title"/></h4>
        <h6><EditableIDProp {...props} label="Question ID"/></h6>
    </div>;
}

export function AnswerPresenter({doc, ...rest}: PresenterProps) {
    return <SemanticDocProp doc={doc as IsaacQuickQuestion} {...rest} prop="answer" name="Answer" />;
}

export function QuickQuestionPresenter(props: PresenterProps) {
    const question = props.doc as IsaacQuickQuestion;
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp doc={question} update={props.update} prop="showConfidence" label="Show confidence question" />
    </>;
}

export function HintsPresenter({doc, update}: PresenterProps) {
    const question = doc as IsaacQuestionBase;
    const docRef = useFixedRef(doc);
    const hints = useMemo(() => {
        return {
            type: "hints",
            children: question.hints,
        };
    }, [question.hints]);
    const childUpdate = useCallback((newHints: Content) => {
        update({
            ...docRef.current,
            hints: newHints.children,
        });
    }, [docRef, update]);
    return <SemanticItem doc={hints} update={childUpdate} />;
}

const choicesType: Record<QUESTION_TYPES, CHOICE_TYPES | null> = {
    isaacQuestion: null,
    isaacMultiChoiceQuestion: "choice",
    isaacNumericQuestion: "quantity",
    isaacSymbolicQuestion: "formula",
    isaacSymbolicChemistryQuestion: "chemicalFormula",
    isaacStringMatchQuestion: "stringChoice",
    isaacFreeTextQuestion: "freeTextRule",
    isaacSymbolicLogicQuestion: "logicFormula",
    isaacGraphSketcherQuestion: "graphChoice",
    isaacRegexMatchQuestion: "regexPattern",
    isaacItemQuestion: "itemChoice",
    isaacParsonsQuestion: "parsonsChoice",
};

// FIXME: replace with ListPresenterProp
export function ChoicesPresenter({doc, update}: PresenterProps) {
    const question = doc as ChoiceQuestion;
    const choices = useMemo(() => {
        return {
            type: "choices",
            // NB: We are reusing layout here for this special component to represent the type of choice
            layout: choicesType[question.type as QUESTION_TYPES] ?? "",
            children: question.choices,
        };
    }, [question.type, question.choices]);
    const docRef = useFixedRef(doc);
    const childUpdate = useCallback((newChoices: Content) => {
        update({
            ...docRef.current,
            choices: newChoices.children,
        });
    }, [docRef, update]);
    return <SemanticItem doc={choices} update={childUpdate} />;
}

export function QuestionFooterPresenter(props: PresenterProps) {
    return <>
        <ChoicesPresenter {...props} />
        <AnswerPresenter {...props} />
        <HintsPresenter {...props} />
    </>;
}

export function MultipleChoiceQuestionPresenter(props: PresenterProps) {
    const {doc, update} = props;
    const question = doc as IsaacMultiChoiceQuestion;
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp doc={question} update={update} prop="randomiseChoices"
                         label="Randomise Choices"/>
    </>;
}

const EditableSignificantFiguresMin = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMin", {label: "from"});
const EditableSignificantFiguresMax = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMax", {label: "to"});
const EditableAvailableUnits = ({doc, update}: PresenterProps<IsaacNumericQuestion>) => {
    return <EditableText
        onSave={(newText) => {
            update({
                ...doc,
                availableUnits: newText?.split("|").map(unit => unit.trim()),
            });
        }}
        text={doc.availableUnits?.join(" | ")}
        label="Available units"
        block
        />;
};
const EditableDisplayUnit = EditableDocPropFor<IsaacNumericQuestion>("displayUnit",  {label: "Display unit", block: true});

export function NumericQuestionPresenter(props: PresenterProps) {
    const {doc, update} = props;
    const question = doc as IsaacNumericQuestion;

    return <>
        <QuestionMetaPresenter {...props} />
        <div>
            <CheckboxDocProp doc={question} update={update} prop="disregardSignificantFigures" label="Exact answers only" />
        </div>
        {!question.disregardSignificantFigures && <div className={styles.questionLabel}>
            Significant figures
            {" "}
            <EditableSignificantFiguresMin doc={question} update={update} />
            {" "}
            <EditableSignificantFiguresMax doc={question} update={update} />
        </div>}
        <div>
            <CheckboxDocProp doc={question} update={update} prop="requireUnits" label="Require choice of units" />
        </div>
        {question.requireUnits ?
            <EditableAvailableUnits doc={question} update={update} />
        :   <EditableDisplayUnit doc={question} update={update} />}
        <div className={styles.questionLabel} /> {/* For spacing */}
    </>;
}


const EditableAvailableSymbols = ({doc, update}: PresenterProps<IsaacSymbolicQuestion>) => {
    return <EditableText
        onSave={(newText) => {
            update({
                ...doc,
                availableSymbols: newText?.split(",").map(unit => unit.trim()),
            });
        }}
        text={doc.availableSymbols?.map(unit => unit.trim()).join(", ")}
        label="Available symbols"
        latex
    />;
};
const EditableFormulaSeed = EditableDocPropFor<IsaacSymbolicQuestion>("formulaSeed", {latex: true, label: "Formula seed", placeHolder: "Enter initial state here"});

const availableMetaSymbols = [
    ["_trigs", "Trigs"],
    ["_1/trigs", "1/Trigs"],
    ["_inv_trigs", "Inv Trigs"],
    ["_inv_1/trigs", "Inv 1/Trigs"],
    ["_hyp_trigs", "Hyp Trigs"],
    ["_inv_hyp_trigs", "Inv Hyp Trigs"],
    ["_logs", "Logarithms"],
    ["_no_alphabet", "No Alphabet"]
];

function hasSymbol(availableSymbols: string[] | undefined, symbol: string) {
    return availableSymbols?.find(s => s === symbol);
}

function SymbolicMetaSymbols({doc, update}: PresenterProps<IsaacSymbolicQuestion>) {
    function toggle(symbol: string) {
        const availableSymbols = [...doc.availableSymbols ?? []];
        const index = availableSymbols.indexOf(symbol);
        if (index !== -1) {
            availableSymbols.splice(index, 1);
        } else {
            availableSymbols.push(symbol);
        }
        update({
            ...doc, availableSymbols
        });
    }

    return <div className={styles.symbolicMetaButtons}>
        {availableMetaSymbols.map(([symbol, label]) =>
            <Button key={symbol}
                    size="sm"
                    color={hasSymbol(doc.availableSymbols, symbol) ? "primary" : "secondary"}
                    onClick={() => toggle(symbol)}>
                {label}
            </Button>
        )}
    </div>;
}

export function SymbolicQuestionPresenter(props: PresenterProps<IsaacSymbolicQuestion>) {
    const {doc} = props;
    return <>
        <QuestionMetaPresenter {...props} />
        <div className={styles.editableFullwidth}>
            <EditableAvailableSymbols {...props} />
        </div>
        {doc.type === "isaacSymbolicQuestion" && <SymbolicMetaSymbols {...props} />}
        <div className={styles.editableFullwidth}>
            <EditableFormulaSeed {...props}/>
        </div>
    </>;
}

export function StringMatchQuestionPresenter(props: PresenterProps<IsaacStringMatchQuestion>) {
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp {...props} prop="multiLineEntry" label="Multi-line" />
    </>;
}

export function FreeTextQuestionInstructions() {
    return <div>
        <h5>Matching Rule Syntax</h5>
        <Alert color="info">
            A fuller set of instructions can be found <a href="https://github.com/isaacphysics/rutherford-content/wiki/Editor-Notes#free-text-questions" target="_">here</a>.
        </Alert>
        <table className={styles.striped}>
            <thead><tr><th>Symbol</th><th>Description</th><th>Rule</th><th>✓️ Match</th><th>✗ Failed Match</th></tr></thead>
            <tbody>
            <tr>
                <td className={styles.center}><code>|</code></td>
                <td>Separate an OR list of word choices</td>
                <td className={styles.nowrap}><code>JavaScript|[Java&nbsp;Script]|JS</code></td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"JavaScript", "Java Script", "JS"</td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"Java"</td>
            </tr>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <tr>
                <td className={styles.center}><code>.</code></td>
                <td>Match only one character</td>
                <td className={styles.center}><code>.a.b.</code></td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"XaXbX"</td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ", "XbXaX"</td>
            </tr>
            <tr>
                <td className={styles.center}><code>*</code></td>
                <td>Match zero or more characters</td>
                <td className={styles.center}><code>*a*b*</code></td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ"</td>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td>"ba", "XbXaX"</td>
            </tr>
            </tbody>
        </table>
    </div>;
}

interface ParsonsContextType {
    items: ParsonsItem[] | undefined;
    remainingItems: ParsonsItem[] | undefined;
}

export const ParsonsContext = createContext<ParsonsContextType>({items: undefined, remainingItems: undefined});

export function ItemOrParsonsQuestionPresenter(props: PresenterProps<IsaacParsonsQuestion>) {
    const {doc} = props;

    return <>
        {doc.type === "isaacParsonsQuestion" && <CheckboxDocProp {...props} prop="disableIndentation" label="Disable indentation" />}
        <BoxedContentValueOrChildrenPresenter {...props} />
        <h6>Items</h6>
        <Row className={styles.itemsHeaderRow}>
            <Col xs={3} className={styles.center}>
                ID
            </Col>
            <Col xs={8} className={styles.center}>
                Value
            </Col>
        </Row>
        <ListPresenterProp {...props} prop="items" />
        <ParsonsContext.Provider value={{items: doc.items, remainingItems: undefined}}>
            <QuestionFooterPresenter {...props} />
        </ParsonsContext.Provider>
    </>;
}

export function ItemPresenter(props: PresenterProps<Item>) {
    return <Row>
        <Col xs={3}>
            <EditableIDProp {...props} />
        </Col>
        <Col xs={8}>
            <EditableValueProp {...props} multiLine />
        </Col>
    </Row>;
}

export function ItemRow({item}: {item: Item}) {
    return <Row>
        <Col xs={3}>
            {item.id}
        </Col>
        <Col xs={9}>
            {item.value}
        </Col>
    </Row>
}

export function ItemChoiceItemPresenter({doc, update}: PresenterProps<Item>) {
    const [isOpen, setOpen] = useState(false);
    const {items, remainingItems} = useContext(ParsonsContext);

    const item = items?.find((item) => item.id === doc.id) ?? {
        id: doc.id,
        value: "Unknown item",
    };

    return <Dropdown className={styles.itemsChoiceRow}
                     toggle={() => setOpen(toggle => !toggle)}
                     isOpen={isOpen}>
        <DropdownToggle outline>
            <ItemRow item={item} />
        </DropdownToggle>
        <DropdownMenu>
            <DropdownItem key={item.id} active>
                <ItemRow item={item} />
            </DropdownItem>
            {remainingItems?.map((i) => {
                return <DropdownItem key={i.id} onClick={() => {
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
}

export function ItemChoiceItemInserter({doc, update, item}: PresenterProps<ItemChoice> & {item: Item}) {
    return <Button className={styles.itemsChoiceInserter} color="primary" onClick={() => {
        update({
            ...doc,
            items: [...doc.items ?? [], item],
        });
    }}>Add</Button>;
}
