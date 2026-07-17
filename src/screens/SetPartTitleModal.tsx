import React, { useState } from "react";
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import styles from "../styles/editor.module.css";

export interface PartTitleModalProps {
    isOpen: boolean;
    setOpen?: (open: boolean) => void;
    isPublished?: boolean;
}

export function SetPartTitleModal(props: PartTitleModalProps) {
    const {isOpen, setOpen, isPublished} = props;
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
            {isPublished && <Alert color="warning">Replacing question part titles on published content may lead to inconsistent progress stats, so should be avoided.</Alert>}
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={() => {
                setOpen?.(false);
                // Some other code
            }}>Set titles</Button>
            <Button color="secondary" onClick={() => setOpen?.(false)}>Cancel</Button>
        </ModalFooter>
    </Modal>;
}

export const showPartTitleModal = (setPartTitleState: (p: PartTitleModalProps) => void) => (isPublished?: boolean): void => {
    setPartTitleState({
        isOpen: true,
        setOpen: (open: boolean) => open ? {} : setPartTitleState(closedPartTitleModalState),
        isPublished,
    });
};

export const closedPartTitleModalState: PartTitleModalProps = ({isOpen: false});
