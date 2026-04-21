import React, { useState } from "react";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export interface RenameModalProps {
    isOpen: boolean;
    currentName: string;
    onClose: (res: RenameResult | null) => void;
}

export type RenameResult = { newName: string; updateImagePaths: boolean };

export function RenameModal(props: RenameModalProps) {
    const isJson = props.currentName.endsWith(".json");
    const [newName, setNewName] = useState(props.currentName);
    const [updateImagePaths, setUpdateImagePaths] = useState(isJson ? true : false);

    const confirm = () => props.onClose({ newName, updateImagePaths });
    const cancel = () => props.onClose(null);

    return <Modal isOpen={props.isOpen}>
        <ModalHeader>Rename file</ModalHeader>
        <ModalBody>
            <FormGroup>
                <Label for="rename-input">Please type a new name for the file. If no extension is provided, &quot;.json&quot; will be assumed.</Label>
                <Input id="rename-input" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            </FormGroup>
            {isJson && <FormGroup check>
                <Input type="checkbox" id="update-image-paths" checked={updateImagePaths}
                    onChange={e => setUpdateImagePaths(e.target.checked)} />
                <Label check for="update-image-paths">Update image paths</Label>
            </FormGroup>}
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={confirm}>Rename</Button>
            <Button color="secondary" onClick={cancel}>Cancel</Button>
        </ModalFooter>
    </Modal>;
}

export const showRenameModal = (setRenameState: (p: RenameModalProps) => void) => (currentName: string): Promise<RenameResult | null> => {
    return new Promise<RenameResult | null>((resolve) => {
        const onClose = (result: RenameResult | null) => {
            setRenameState({ isOpen: false, currentName: "", onClose });
            resolve(result);
        };
        setRenameState({ isOpen: true, currentName, onClose });
    });
};

export const closedRenameModalState = (): RenameModalProps => ({isOpen: false, currentName: "", onClose: () => {}});
