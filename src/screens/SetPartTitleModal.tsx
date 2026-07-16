import React, { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import styles from "../styles/editor.module.css";

export interface PartTitleModalProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

export function SetPartTitleModal(props: PartTitleModalProps) {
    const {isOpen, setOpen} = props;

    return <Modal isOpen={isOpen}>
        <ModalHeader>title</ModalHeader>
        <ModalBody className={styles.menuModalButtons}>
            body
        </ModalBody>
        <ModalFooter><Button color="danger" onClick={() => {
            setOpen(false);
        }}>Cancel</Button></ModalFooter>
    </Modal>;
}

export const showPartTitleModal = (setPartTitleState: (p: PartTitleModalProps) => void) => (): void => {
    setPartTitleState({ isOpen: true, setOpen: () => setPartTitleState({ isOpen: false, setOpen: () => {}})});
};

export const closedPartTitleModalState = (): PartTitleModalProps => ({isOpen: false, setOpen: () => {}});
