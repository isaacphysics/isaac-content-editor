import React from "react";
import { PresenterProps } from "../registry";
import { IsaacLLMFreeTextQuestion, LLMFreeTextMarkedExample, LLMFreeTextMarkSchemeEntry } from "../../../isaac-data-types";
import { NumberDocPropFor } from "../props/NumberDocPropFor";
import { EditableText } from "../props/EditableText";
import { isDefined } from "../../../utils/types";
import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { parseMarkingFormula } from "../../../services/llmMarkingFormula";
import styles from "../styles/editable.module.css";
import { evaluateMarkingFormula, evaluateMarkTotal, tallyMarkUses } from "../../../utils/llmMarkingFormula";
import { FormFeedback } from "reactstrap";
import { HintsPresenter } from "./questionPresenters";

const MaxMarksEditor = NumberDocPropFor<IsaacLLMFreeTextQuestion>("maxMarks");

export function LLMQuestionPresenter(props: PresenterProps<IsaacLLMFreeTextQuestion>) {
    const {doc, update} = props;

    // Mark scheme operations - these changes also update marked examples
    function updateMark<T extends keyof LLMFreeTextMarkSchemeEntry>(index: number, field: T, value: LLMFreeTextMarkSchemeEntry[T]) {
        let possiblyUpdatedMarkedExamples = doc.markedExamples;
        if (field === "jsonField") { // also update marked examples mark fieldnames
            const prevJsonFieldValue = doc.markScheme?.[index].jsonField;
            if (isDefined(prevJsonFieldValue)) {
                possiblyUpdatedMarkedExamples = doc.markedExamples?.map(me => {
                    const newMarks = {...me.marks, [value as string]: me.marks?.[prevJsonFieldValue] ?? 0};
                    delete newMarks[prevJsonFieldValue];
                    return { ...me, marks: newMarks, marksAwarded: evaluateMarkTotal(doc.markingFormula, {...newMarks, "maxMarks": doc.maxMarks ?? 0}) };
                });
            }
        }
        update({
            ...doc,
            markScheme: doc.markScheme?.map((msi, i) => i === index ? {...msi, [field]: value} : msi),
            markedExamples: possiblyUpdatedMarkedExamples
        });
    }
    
    function addMark() {
        const baseDefaultJsonFieldname = "jsonFieldToRename";
        const existingJsonFields = new Set(doc.markScheme?.map(msi => msi.jsonField));
        let nextFreeJsonFieldnameSuffix = 0;
        while (existingJsonFields.has(`${baseDefaultJsonFieldname}${nextFreeJsonFieldnameSuffix}`)) {
            nextFreeJsonFieldnameSuffix++;
        }
        const defaultJsonFieldname = `${baseDefaultJsonFieldname}${nextFreeJsonFieldnameSuffix}`;
        update({
            ...doc,
            markScheme: [...doc.markScheme ?? [], {
                jsonField: defaultJsonFieldname,
                shortDescription: "Description (shown to user)",
                marks: 1
            }],
            markedExamples: doc.markedExamples?.map(me => ({
                ...me,
                marks: {...me.marks, [defaultJsonFieldname]: 0}
            }))
        });
    }

    function deleteMark(jsonFieldname: string | undefined) {
        if (!jsonFieldname) { return; }
        update({
            ...doc,
            markScheme: doc.markScheme?.filter(msi => msi.jsonField !== jsonFieldname),
            markedExamples: doc.markedExamples?.map(me => {
                const newMarks = {...me.marks};
                delete newMarks[jsonFieldname];
                return { ...me, marks: newMarks };
            })
        });
    }

    // Marked example operations
    function updateExample<T extends keyof LLMFreeTextMarkedExample>(index: number, field: T, value: LLMFreeTextMarkedExample[T]) {
        update({
            ...doc,
            markedExamples: doc.markedExamples?.map((me, i) => i === index ? {
                ...me, 
                marksAwarded: field === "marks" ? evaluateMarkTotal(doc.markingFormula, {...(value as Record<string, number>), "maxMarks": doc.maxMarks ?? 0}) : me.marksAwarded,
                [field]: value, 
            } : me)
        });
    }

    function addExample() {
        update({
            ...doc,
            markedExamples: [...doc.markedExamples ?? [], {
                answer: "Example answer",
                marks: doc.markScheme?.reduce<Record<string, number>>((acc, mark) => ({...acc, [mark.jsonField ?? ""]: 0}), {}),
                marksAwarded: 0
            }]
        });
    }

    function deleteExample(index: number) {
        update({
            ...doc,
            markedExamples: doc.markedExamples?.filter((_, i) => i !== index)
        });
    }

    function validateMarkingFormula(value?: string) {
        if (!value) {
            return;
        }

        const openBracketsCount = value.split('(').length - 1;
        const closeBracketsCount = value.split(')').length - 1;
        const regexStr = /[^a-zA-Z0-9(),\s]+/;
        const badCharacters = new RegExp(regexStr);
        if (badCharacters.test(value)) {
            const usedBadChars: string[] = [];
            for(let i = 0; i < value.length; i++) {
                const char = value.charAt(i);
                if (badCharacters.test(char)) {
                    if (!usedBadChars.includes(char)) {
                        usedBadChars.push(char);
                    }
                }
            }
            errors.push('Some of the characters you are using are not allowed: ' + usedBadChars.join(" "));
        }
        if (openBracketsCount !== closeBracketsCount) {
            errors.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
        }
        try { 
            const formula = parseMarkingFormula(value);
            evaluateMarkingFormula(formula, {...doc.markScheme?.reduce<Record<string, number>>((acc, mark) => ({...acc, [mark.jsonField ?? ""]: 0}), {}) ?? {}, 
                                                            "maxMarks": doc.maxMarks ?? 0
                                                        });
        } 
        catch (e: any) { 
            return `${e}`;
        }
    }

    function updateMarkingFormula(value?: string) {
        update({
            ...doc,
            markingFormulaString: value,
            markingFormula: parseMarkingFormula(value),
            markedExamples: doc.markedExamples?.map(me => ({...me, marksAwarded: evaluateMarkTotal(parseMarkingFormula(value), {...me.marks, "maxMarks": doc.maxMarks ?? 0})}))
        })
    }

    const markTally = tallyMarkUses(doc.markingFormula);
    const missingMarks = (doc.markScheme?.map(msi => msi.jsonField ?? "") ?? []).filter(mark => !markTally[mark]);

    const functionNamesMap: [string, string][] = [["SUM", "SUM("], ["MAX", "MAX("], ["MIN", "MIN("], [")", ")"]]; // These are the only functions we support for now
    const constantNamesMap: [string, string][] = [["0", "0"], ["1", "1"]];
    const variableNamesMap: [string, string][] = doc.markScheme?.map(msi => msi.jsonField ? [msi.jsonField, msi.jsonField] as [string, string] : ["", ""]) ?? [["", ""]];
    const buttonStrings: [string, string][] = [...functionNamesMap, ...constantNamesMap, ...variableNamesMap, ["maxMarks", "maxMarks"]];

    return <div>
        <h2 className="h5">Mark scheme</h2>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <td><strong>JSON fieldname</strong></td>
                    <td><strong>Short description</strong></td>
                </tr>
            </thead>
            <tbody>
                {doc.markScheme?.map((mark, i) => <tr key={mark.jsonField}>
                    <td>
                        <pre><EditableText
                            text={mark.jsonField}
                            hasError={value => !value?.match(/^[a-z][a-zA-Z0-9]+$/) ? "Invalid JSON fieldname format" : undefined}
                            onSave={value => updateMark(i, "jsonField", value)}
                        /></pre>
                    </td>
                    <td>
                        <div className="d-flex justify-content-between">
                            <div className="flex-fill">
                                <EditableText text={mark.shortDescription} multiLine block onSave={value => updateMark(i, "shortDescription", value)} />
                            </div>
                            <button className="btn btn-sm mb-2 ml-2" onClick={() => deleteMark(mark.jsonField)}>❌</button>
                        </div>
                    </td>
                </tr>)}
                <tr>
                    <td colSpan={2}>
                        <button className="btn btn-secondary" onClick={addMark}>Add mark</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        <strong><pre>maxMarks</pre></strong>
                        {doc.maxMarks === undefined && 
                            <FormFeedback className={styles.feedback}> maxMarks is a required field </FormFeedback>
                        }
                    </td>
                    <td><MaxMarksEditor {...props} /></td>
                </tr>
                <tr>
                    <td>
                        <strong>Marking formula</strong>
                        <br/>
                        <div>
                            {(!!validateMarkingFormula(doc.markingFormulaString) || !doc.markingFormulaString) && 
                                <FormFeedback className={styles.feedback}> Using default marking formula </FormFeedback>
                            }
                        </div>
                        <div>
                            {doc.markingFormulaString && missingMarks.length > 0 && 
                                <FormFeedback className={styles.feedback}>
                                    {"Missing the following mark(s): " + missingMarks.reduce((markList, currentMark) => markList + ", " + currentMark)}
                                </FormFeedback>
                            }
                        </div>
                    </td>
                    <td>
                        <div className="flex-fill">
                            <EditableText
                                multiLine={true}
                                block={true}
                                label="Marking formula"
                                placeHolder="e.g. MIN(maxMarks, SUM(... all marks ...))"
                                text={doc.markingFormulaString}
                                hasError={value => validateMarkingFormula(value)}
                                onSave={value => updateMarkingFormula(value)}
                                buttonStrings={buttonStrings}
                                inputProps={{ className: styles["llm_formula_input"] }}
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><strong>Additional marking instructions</strong></td>
                    <td>
                        <EditableText
                            text={doc.additionalMarkingInstructions} multiLine block
                            onSave={ams => update({...doc, additionalMarkingInstructions: ams})}
                        />
                    </td>
                </tr>
            </tfoot>
        </table>

        <h2 className="h4">Marked examples</h2>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <td className="w-50"><strong>Answer</strong></td>
                    <td><strong>Marks</strong></td>
                    <td><strong>Mark total</strong></td>
                </tr>
            </thead>
            <tbody>
                {doc.markedExamples?.map((example, i) => <tr key={i}>
                    <td>
                        <EditableText text={example.answer} multiLine block onSave={value => updateExample(i, "answer", value)} />
                    </td>
                    <td>
                        {Object.keys(example.marks ?? {}).sort().map((jsonFieldname) => <div key={jsonFieldname}>
                            {/* We assume, for now, that each point earns a single. Each one can be represented as a checkbox. */}
                            <CheckboxDocProp
                                label={jsonFieldname}
                                doc={Object.entries(example.marks ?? {}).reduce<Record<string, boolean>>((booleanMarks, [key, val]) => ({...booleanMarks, [key]: val === 1}), {})}
                                prop={jsonFieldname}
                                update={newMarks => updateExample(i, "marks", {...example.marks, [jsonFieldname]: newMarks[jsonFieldname] ? 1 : 0})}
                            />
                        </div>)}
                    </td>
                    <td>
                        <div className="d-flex justify-content-between">
                            <div className="flex-fill">
                                {doc.markingFormula ? 
                                <div>
                                    {example.marksAwarded}
                                </div> 
                                :
                                <EditableText
                                    text={example.marksAwarded?.toString()}
                                    hasError={value => doc.maxMarks && parseInt(value ?? "0", 10) > doc.maxMarks ? "Exceeds question's max marks" : undefined}
                                    onSave={value => updateExample(i, "marksAwarded", parseInt(value ?? "0", 10))}
                                />}
                            </div>
                            <button className="btn btn-sm mb-2 ml-2" onClick={() => deleteExample(i)}>❌</button>
                        </div>
                    </td>
                </tr>)}
                <tr>
                    <td colSpan={3}>
                        <button className="btn btn-secondary" onClick={addExample}>Add marked example</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <HintsPresenter {...props} />
    </div>;
}
