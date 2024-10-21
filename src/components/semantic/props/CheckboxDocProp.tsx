import { Input, Label } from "reactstrap";
import styles from "../styles/question.module.css";
import React, { useEffect } from "react";
import { PresenterProps } from "../registry";

type CheckboxDocProps<K extends keyof D, D> =
    & PresenterProps<D>
    & {
    prop: K;
    label: string;
    checkedIfUndefined?: boolean;
    disabled?: boolean;
};

export function CheckboxDocProp<K extends keyof D, D extends { [Key in K]?: boolean }>({
    doc,
    update,
    prop,
    label,
    checkedIfUndefined,
    disabled,
}: CheckboxDocProps<K, D>) {
    useEffect(()=> {
        if (disabled && doc[prop]) {
            update({
                ...doc,
                [prop]: checkedIfUndefined ?? false,
            });
        }
    }, [checkedIfUndefined, disabled, doc, prop, update]);

    return <Label className={styles.checkboxLabel} style={{color: disabled ? "gray" : "black"}}>
        <Input type="checkbox"
               disabled={disabled}
               checked={doc[prop] ?? checkedIfUndefined ?? false}
               onChange={(e) => {
                   update({
                       ...doc,
                       [prop]: e.target.checked,
                   });
               }}
        />
        {label}
    </Label>;
}
