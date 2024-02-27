import React from "react";

import { Content } from "../../isaac-data-types";
import { FigureNumberingContext } from "../../isaac/IsaacTypes";
import { useFigureNumbering } from "../../isaac/WithFigureNumbering";

import { SemanticItem } from "./SemanticItem";
import styles from "./styles/semantic.module.css";

interface SemanticRootProps {
  doc: Content;
  update: (newContent: Content, invertible?: boolean) => void;
}

export function SemanticRoot({ doc, update }: SemanticRootProps) {
  const figureNumbers = useFigureNumbering(doc);

  return (
    <FigureNumberingContext.Provider value={figureNumbers}>
      <div className={styles.outerWrapper}>
        <SemanticItem doc={doc} update={update} />
      </div>
    </FigureNumberingContext.Provider>
  );
}
