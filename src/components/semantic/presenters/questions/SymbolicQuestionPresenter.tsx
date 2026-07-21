import React from "react";
import {EditableDocPropFor} from "../../props/EditableDocProp";
import styles from "../../styles/question.module.css";
import {Button} from "reactstrap";
import {IsaacSymbolicChemistryQuestion, IsaacSymbolicQuestion} from "../../../../isaac-data-types";
import {EditableText} from "../../props/EditableText";
import {CheckboxDocProp} from "../../props/CheckboxDocProp";
import {PresenterProps} from "../../registry";
import { QuestionMetaPresenter } from "./QuestionMetaPresenter";

const EditableAvailableSymbols = ({doc, update}: PresenterProps<IsaacSymbolicQuestion>) => {
    return <EditableText
        onSave={(newText) => {
            update({
                ...doc,
                availableSymbols: newText?.split(",").map(unit => unit.trim()),
            });
        }}
        text={doc.availableSymbols?.map(unit => unit.trim()).join(", ")}
        placeHolder="Enter list of symbols here (,-separated)"
        label="Available symbols"
        format={"latex"}
    />;
};
const EditableFormulaSeed = EditableDocPropFor<IsaacSymbolicQuestion>("formulaSeed", {format: "latex", label: "Formula seed", placeHolder: "Enter initial state here"});

const availableMetaSymbols: [string,string][] = [
    ["_trigs", "Trigs"],
    ["_1/trigs", "1/Trigs"],
    ["_inv_trigs", "Inv Trigs"],
    ["_inv_1/trigs", "Inv 1/Trigs"],
    ["_hyp_trigs", "Hyp Trigs"],
    ["_inv_hyp_trigs", "Inv Hyp Trigs"],
    ["_logs", "Logarithms"],
    ["_no_alphabet", "No Alphabet"]
];

const availableChemistryMetaSymbols: [string,string][]  = [
    ["_state_symbols", "State Symbols"], 
    ["_plus", "Plus"],
    ["_minus", "Minus"],
    ["_fraction", "Fraction"],
    ["_right_arrow", "Right Arrow"],
    ["_equilibrium_arrow", "Equilibrium Arrow"],
    ["_brackets_round", "Round Brackets"],
    ["_brackets_square", "Square Brackets"],
    ["_dot", "Dot"]
];  

function hasSymbol(availableSymbols: string[] | undefined, symbol: string) {
    return availableSymbols?.find(s => s === symbol);
}

function SymbolicMetaSymbols({doc, update, metaSymbols}: PresenterProps<IsaacSymbolicQuestion> & {metaSymbols: [string, string][]}) {
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
        {metaSymbols.map(([symbol, label]) =>
            <Button key={symbol}
                size="sm"
                color={hasSymbol(doc.availableSymbols, symbol) ? "primary" : "secondary"}
                onClick={() => toggle(symbol)}>
                {label}
            </Button>
        )}
    </div>;
}

function SymbolicQuestionPresenterHead(props: PresenterProps<IsaacSymbolicQuestion>) {
    return <>
        <QuestionMetaPresenter {...props} />
        <div className={styles.editableFullwidth}>
            <EditableAvailableSymbols {...props} />
        </div>
    </>;
}

export function SymbolicChemistryQuestionPresenter(props: PresenterProps<IsaacSymbolicChemistryQuestion>) {
    return <>
        <SymbolicQuestionPresenterHead {...props}/>
        {!props.doc.isNuclear && <SymbolicMetaSymbols {...props} metaSymbols={availableChemistryMetaSymbols} />}
        <hr />
        <CheckboxDocProp {...props} className="d-inline-block" prop="isNuclear" label="Nuclear question" />
        <CheckboxDocProp {...props} className="d-inline-block" prop="allowPermutations" label="Allow molecule permutations" disabled={props.doc.isNuclear} />
        <CheckboxDocProp {...props} className="d-inline-block" prop="allowScalingCoefficients" label="Allow coefficient scaling" disabled={props.doc.isNuclear} />
        <CheckboxDocProp {...props} prop="showInequalitySeed" label="Show seed in inequality before opening the editor" />
        <div className={styles.editableFullwidth}>
            <EditableFormulaSeed {...props}/>
        </div>
    </>;
}

export function SymbolicQuestionPresenter(props: PresenterProps<IsaacSymbolicQuestion>) {
    return <>
        <SymbolicQuestionPresenterHead {...props} />
        {props.doc.type === "isaacSymbolicQuestion" && <SymbolicMetaSymbols {...props} metaSymbols={availableMetaSymbols} />}
        <hr />
        <div className={styles.editableFullwidth}>
            <EditableFormulaSeed {...props}/>
        </div>
    </>;
}
