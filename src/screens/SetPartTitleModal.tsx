import React, { useContext, useState } from "react";
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

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
    const [overrideOldTitles, setOverrideOldTitles] = useState(false);

    return <Modal isOpen={isOpen}>
        <ModalHeader>Set question part titles</ModalHeader>
        <ModalBody className={styles.menuModalButtons}>
            Rename the titles of question parts inside accordions to match a standard format
            (e.g. &quot;A.i&quot;, &quot;A.ii&quot;, &quot;B&quot;, etc)
            <FormGroup check className="my-2">
                <Input type="checkbox" id="override-old-titles" checked={overrideOldTitles}
                    onChange={e => setOverrideOldTitles(e.target.checked)} />
                <Label check for="override-old-titles">Override titles not already in the standard format</Label>
            </FormGroup>
            {content?.published && <Alert color="warning">Replacing question part titles on published content may lead to inconsistent progress stats, so should be avoided.</Alert>}
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={() => {
                const newContent = makeQuestionTitlesStandard(content, overrideOldTitles);
                appContext.editor.setCurrentDoc(newContent);
                setOpen?.(false);
            }}>Set titles</Button>
            <Button color="secondary" onClick={() => setOpen?.(false)}>Cancel</Button>
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
