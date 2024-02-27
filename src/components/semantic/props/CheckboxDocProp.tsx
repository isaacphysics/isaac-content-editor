import { Input, Label } from "reactstrap";
import styles from "../styles/question.module.css";
import React from "react";
import { PresenterProps } from "../registry";

type CheckboxDocProps<K extends keyof D, D> = PresenterProps<D> & {
  prop: K;
  label: string;
  checkedIfUndefined?: boolean;
};

export function CheckboxDocProp<K extends keyof D, D extends { [Key in K]?: boolean }>({
  doc,
  update,
  prop,
  label,
  checkedIfUndefined,
}: CheckboxDocProps<K, D>) {
  return (
    <Label className={styles.checkboxLabel}>
      <Input
        type="checkbox"
        checked={doc[prop] ?? checkedIfUndefined ?? false}
        onChange={(e) => {
          update({
            ...doc,
            [prop]: e.target.checked,
          });
        }}
      />
      {label}
    </Label>
  );
}
