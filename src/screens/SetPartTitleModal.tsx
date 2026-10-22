import React, { useContext, useState } from "react";
import { Alert, Button, FormGroup, Form, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";

import styles from "../styles/editor.module.css";
import { AppContext } from "../AppContext";
import { makeQuestionTitlesStandard } from "../utils/setQuestionTitles";
import { Content } from "../isaac-data-types";

export interface PartTitleModalProps {
    isOpen: boolean;
    setOpen?: (open: boolean) => void;
}

export function SetPartTitleModal(props: PartTitleModalProps) {
    const appContext = useContext(AppContext);
    let content: Content | null = null;
    try {
        content = appContext.editor.getCurrentDoc();
    } catch (_e) {
        // No doc currently
    }

    const {isOpen, setOpen} = props;
    const [overwriteOldTitles, setOverwriteOldTitles] = useState(true);

    const closeModal = () => {
        setOverwriteOldTitles(true);
        setOpen?.(false);
    };

    return <Modal show={isOpen}>
        <Modal.Header>Set question part titles</Modal.Header>
        <Modal.Body className={styles.menuModalButtons}>
            <span>
                Rename the titles of question parts <b>inside accordions</b> to match a standard format
                (e.g. &quot;A.i&quot;, &quot;A.ii&quot;, &quot;B&quot;, etc)
            </span>
            <FormGroup className="my-2">
                <Form.Check id="overwrite-old-titles">
                    <Form.Check.Input checked={overwriteOldTitles} onChange={e => setOverwriteOldTitles(e.target.checked)}/>
                    <Form.Check.Label>
                        <span className="me-2">Overwrite titles not already in the standard format</span>
                        <OverlayTrigger placement="bottom" overlay={
                            <Tooltip>Titles in the standard format but incorrect position (or empty titles) will be overwritten regardless</Tooltip>
                        }>
                            <span style={{textDecoration: "underline", color:"blue"}} id="overwrite-tooltip">?</span>
                        </OverlayTrigger>
                        
                    </Form.Check.Label>
                </Form.Check>
            </FormGroup>
            {content?.published && <Alert variant="warning">Replacing question part titles on published content may lead to inconsistent progress stats, so should be avoided.</Alert>}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={() => {
                if (content) {
                    const newContent = makeQuestionTitlesStandard(content, overwriteOldTitles);
                    appContext.editor.setCurrentDoc(newContent);
                    closeModal();
                }
            }}>Set titles</Button>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        </Modal.Footer>
    </Modal>;
}

export const showPartTitleModal = (setPartTitleState: (p: PartTitleModalProps) => void) => (): void => {
    setPartTitleState({
        isOpen: true,
        setOpen: (open: boolean) => open ? {} : setPartTitleState(closedPartTitleModalState),
    });
};

export const closedPartTitleModalState: PartTitleModalProps = ({isOpen: false});
