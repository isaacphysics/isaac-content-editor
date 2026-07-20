import React, { useContext, useState } from "react";
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from "reactstrap";

import styles from "../styles/editor.module.css";
import { AppContext } from "../App";
import { makeQuestionTitlesStandard } from "../utils/setQuestionTitles";

export interface PartTitleModalProps {
    isOpen: boolean;
    setOpen?: (open: boolean) => void;
}

export function SetPartTitleModal(props: PartTitleModalProps) {
    const appContext = useContext(AppContext);
    const content = appContext?.editor.getCurrentDoc();

    const {isOpen, setOpen} = props;
    const [overwriteOldTitles, setOverwriteOldTitles] = useState(true);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const closeModal = () => {
        setOverwriteOldTitles(true);
        setOpen?.(false);
    };

    return <Modal isOpen={isOpen}>
        <ModalHeader>Set question part titles</ModalHeader>
        <ModalBody className={styles.menuModalButtons}>
            <span>
                Rename the titles of question parts <b>inside accordions</b> to match a standard format
                (e.g. &quot;A.i&quot;, &quot;A.ii&quot;, &quot;B&quot;, etc)
            </span>
            <FormGroup check className="my-2">
                <Input type="checkbox" id="overwrite-old-titles" checked={overwriteOldTitles}
                    onChange={e => setOverwriteOldTitles(e.target.checked)} />
                <Label check for="overwrite-old-titles">
                    <span className="me-2">Overwrite titles not already in the standard format</span>
                    <span style={{textDecoration: "underline", color:"blue"}} id="overwrite-tooltip">?</span>
                    <Tooltip isOpen={tooltipOpen} placement="bottom" target="overwrite-tooltip" toggle={() => setTooltipOpen(!tooltipOpen)}>
                        {"Titles in the standard format but incorrect position (or empty titles) will be overwritten regardless"}
                    </Tooltip>
                </Label>
            </FormGroup>
            {content?.published && <Alert color="warning">Replacing question part titles on published content may lead to inconsistent progress stats, so should be avoided.</Alert>}
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={() => {
                const newContent = makeQuestionTitlesStandard(content, overwriteOldTitles);
                appContext.editor.setCurrentDoc(newContent);
                closeModal();
            }}>Set titles</Button>
            <Button color="secondary" onClick={closeModal}>Cancel</Button>
        </ModalFooter>
    </Modal>;
}

export const showPartTitleModal = (setPartTitleState: (p: PartTitleModalProps) => void) => (): void => {
    setPartTitleState({
        isOpen: true,
        setOpen: (open: boolean) => open ? {} : setPartTitleState(closedPartTitleModalState),
    });
};

export const closedPartTitleModalState: PartTitleModalProps = ({isOpen: false});
