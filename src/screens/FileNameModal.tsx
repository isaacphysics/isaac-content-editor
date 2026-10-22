import React, { useState } from "react";
import { Button, FormGroup, Form, Modal } from "react-bootstrap";

export interface FileNameModalProps {
    actionName: string;
    isOpen: boolean;
    currentName: string;
    onClose: (res: FileNameResult | null) => void;
}

export type FileNameResult = { newName: string; updateImagePaths: boolean };

export function FileNameModal(props: FileNameModalProps) {
    const [newName, setNewName] = useState(props.currentName);
    const isJson = props.currentName.endsWith(".json");
    const [updateImagePaths, setUpdateImagePaths] = useState(isJson);

    const confirm = () => props.onClose({ newName, updateImagePaths });
    const cancel = () => props.onClose(null);

    return <Modal show={props.isOpen} toggle={cancel} onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && confirm()} autoFocus={false}>
        <Modal.Header >File: {props.actionName}</Modal.Header>
        <Modal.Body>
            <FormGroup>
                <Form.Label for="rename-input">Please type a new name for the file. If no extension is provided, &quot;.json&quot; will be assumed.</Form.Label>
                <Form.Control id="rename-input" value={newName} onChange={e => setNewName(e.target.value)} autoFocus/>
            </FormGroup>
            {isJson && <FormGroup>
                <Form.Check id="update-image-paths" checked={updateImagePaths}
                    onChange={e => setUpdateImagePaths(e.target.checked)} label="Update image paths"/>
            </FormGroup>}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={confirm}>{props.actionName}</Button>
            <Button variant="secondary" onClick={cancel}>Cancel</Button>
        </Modal.Footer>
    </Modal>;
}

export const showFileNameModal = (setRenameState: (p: FileNameModalProps) => void) => (actionName: string, currentName: string): Promise<FileNameResult | null> => {
    return new Promise((resolve) => {
        const onClose = (result: FileNameResult | null) => {
            setRenameState({ actionName, isOpen: false, currentName: "", onClose });
            resolve(result);
        };
        setRenameState({ actionName, isOpen: true, currentName, onClose });
    });
};

export const closedFileNameModalState: FileNameModalProps = {actionName: "", isOpen: false, currentName: "", onClose: () => {}};
