import React, { useContext, useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";

import { AppContext } from "../App";
import { Content } from "../isaac-data-types";
import { getConfig } from "../services/config";

import styles from "../styles/editor.module.css";

export type PreviewMode = "modal" | "panel";

export const defaultPreview = {
  open: false,
  toggle: (() => {
    throw new Error("preview.toggle called outside AppContext");
  }) as () => void,
  mode: "modal" as PreviewMode,
  toggleMode: (() => {
    throw new Error("preview.toggleMode called outside AppContext");
  }) as () => void,
};

export function Preview() {
  const appContext = useContext(AppContext);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    function messageHandler(event: MessageEvent) {
      if ("ready" in event.data) {
        setReady(true);
        done();
      }
    }
    function done() {
      window.removeEventListener("message", messageHandler);
    }
    window.addEventListener("message", messageHandler);
    return done;
  }, []);

  let doc: Content | null = null;
  try {
    doc = appContext.editor.getCurrentDoc();
  } catch (e) {
    // No doc currently
  }

  const { previewServer } = getConfig();

  useEffect(() => {
    if (ready) {
      const previewURL = new URL(previewServer);
      iframeRef.current?.contentWindow?.postMessage({ doc }, previewURL.origin);
    }
  }, [doc, ready, previewServer]);

  return (
    <div className={styles.previewWrapper}>
      <div className="m-2">
        Preview for: <span className="font-weight-bold">{doc?.title ?? "undefined"}</span>
      </div>
      <iframe
        ref={iframeRef}
        className={`${styles.previewIframe} ${!ready ? styles.displayNone : ""}`}
        title="Isaac Preview"
        src={previewServer}
      />
      {!ready && (
        <div className={styles.centered}>
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
}
