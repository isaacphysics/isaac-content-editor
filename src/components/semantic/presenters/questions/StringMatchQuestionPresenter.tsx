import React from "react";
import { QuestionMetaPresenter } from "./QuestionMetaPresenter";
import styles from "../../styles/question.module.css";
import { PresenterProps } from "../../registry";
import { IsaacStringMatchQuestion } from "../../../../isaac-data-types";
import { CheckboxDocProp } from "../../props/CheckboxDocProp";
import { Alert } from "reactstrap";

function FreeTextQuestionInstructions() {
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
                { }
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

export function StringMatchQuestionPresenter(props: PresenterProps<IsaacStringMatchQuestion>) {
    return <>
        <QuestionMetaPresenter {...props} />
        <CheckboxDocProp {...props} prop="multiLineEntry" label="Multi-line" />
        {props.doc.type === "isaacFreeTextQuestion" && <FreeTextQuestionInstructions/>}
    </>;
}

