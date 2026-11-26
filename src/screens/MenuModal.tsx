import React, { MutableRefObject, useImperativeHandle, useState } from "react";
import { Button, Modal } from "react-bootstrap";

import styles from "../styles/editor.module.css";

interface ModalOption {
    caption: string;
    value: string;
}

export interface MenuModalProps {
    title: string;
    body: string;
    options: ModalOption[];
    callback: (selected: ModalOption | null) => void;
}

export interface MenuModalRef {
    open: (props: MenuModalProps) => void;
}

export function MenuModal({menuRef}: {menuRef: MutableRefObject<MenuModalRef|null>}) {
    const [isOpen, setOpen] = useState(false);
    const [props, setProps] = useState<MenuModalProps>(undefined as unknown as MenuModalProps);

    useImperativeHandle(menuRef, () => ({
        open: (props) => {
            setOpen(true);
            setProps(props);
        },
    }), []);

    if (!props) {
        return null;
    }

    // eslint-disable-next-line react/prop-types
    const {title, body, options, callback} = props;

    return <Modal show={isOpen}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body className={styles.menuModalButtons}>
            <p>{body}</p>
            {/* eslint-disable-next-line react/prop-types */}
            {options.map(option => <Button key={option.value} variant="secondary" onClick={() => {
                setOpen(false);
                callback(option);
            }}>{option.caption}</Button>)}
        </Modal.Body>
        <Modal.Footer><Button variant="danger" onClick={() => {
            setOpen(false);
            callback(null);
        }}>Cancel</Button></Modal.Footer>
    </Modal>;
}
