import React, { MutableRefObject, useImperativeHandle, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

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

export function MenuModal({ menuRef }: { menuRef: MutableRefObject<MenuModalRef | null> }) {
  const [isOpen, setOpen] = useState(false);
  const [props, setProps] = useState<MenuModalProps>(undefined as unknown as MenuModalProps);

  useImperativeHandle(
    menuRef,
    () => ({
      open: (props) => {
        setOpen(true);
        setProps(props);
      },
    }),
    [],
  );

  if (!props) {
    return null;
  }

  // eslint-disable-next-line react/prop-types
  const { title, body, options, callback } = props;

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody className={styles.menuModalButtons}>
        <p>{body}</p>
        {/* eslint-disable-next-line react/prop-types */}
        {options.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              setOpen(false);
              callback(option);
            }}
          >
            {option.caption}
          </Button>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={() => {
            setOpen(false);
            callback(null);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
