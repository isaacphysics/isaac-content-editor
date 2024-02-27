import React, { MouseEventHandler, useState } from "react";
import { Button } from "reactstrap";
import styles from "./styles/question.module.css";

const MAX_CHARS_BEFORE_SHORTEN = 75;
export function ExpandableText({ text }: { text?: string }) {
  const needsToBeShortened = text && text.length > MAX_CHARS_BEFORE_SHORTEN;
  const [shortened, setShortened] = useState<boolean>(true);
  const toggle: MouseEventHandler<HTMLButtonElement> = (e) => {
    setShortened((s) => !s);
    e.stopPropagation();
  };
  if (text && needsToBeShortened) {
    const shortenedText = text.slice(0, MAX_CHARS_BEFORE_SHORTEN);
    return (
      <>
        {shortened ? shortenedText : text}
        <span>{shortened && "..."}</span>
        <br />
        <div className={"w-100 text-center"}>
          <Button size={"sm"} color="link" className={styles.expandTextButton} onClick={toggle}>
            <small>(Show {shortened ? "more" : "less"})</small>
          </Button>
        </div>
      </>
    );
  }
  return <>{text ?? ""}</>;
}
