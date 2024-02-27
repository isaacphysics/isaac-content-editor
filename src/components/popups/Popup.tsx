import React, {
  MutableRefObject,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "../../styles/editor.module.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Portal from "reactstrap/src/Portal";

export const PopupCloseContext = React.createContext<(() => void) | null>(null);

export interface PopupRef {
  open: (event: React.MouseEvent) => void;
}

export function Popup({ popUpRef, children }: { popUpRef: MutableRefObject<PopupRef | null>; children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const insideRef = useRef<HTMLDivElement | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setAnchorPoint({ x: event.pageX, y: event.pageY });
      if (event.pageY + (insideRef.current?.clientHeight ?? 0) > window.innerHeight) {
        setAnchorPoint({ x: event.pageX, y: event.pageY - (insideRef.current?.clientHeight ?? 0) });
      }
      setOpen(true);
    },
    [setAnchorPoint, setOpen],
  );

  const closeOutside = useCallback((event: MouseEvent) => {
    if (insideRef.current?.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
    event.stopPropagation();
    event.preventDefault();
  }, []);
  useLayoutEffect(() => {
    if (isOpen) {
      if (anchorPoint.y + (insideRef.current?.clientHeight ?? 0) > window.innerHeight) {
        setAnchorPoint({ x: anchorPoint.x, y: anchorPoint.y - (insideRef.current?.clientHeight ?? 0) });
      }
      document.addEventListener("click", closeOutside, { capture: true });
      return () => document.removeEventListener("click", closeOutside, { capture: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, closeOutside]);

  useImperativeHandle(
    popUpRef,
    () => ({
      open: handleContextMenu,
    }),
    [handleContextMenu],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return isOpen ? (
    <Portal>
      <div
        className={styles.popup}
        style={{
          top: anchorPoint.y,
          left: anchorPoint.x,
        }}
        ref={insideRef}
      >
        <PopupCloseContext.Provider value={close}>{children}</PopupCloseContext.Provider>
      </div>
    </Portal>
  ) : null;
}
