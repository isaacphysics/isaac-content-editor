import React from "react";

import { IsaacInlineQuestion } from "../../../isaac-data-types";
import { PresenterProps } from "../registry";
import { ListPresenterProp } from "../props/listProps";
import { Box } from "../SemanticItem";

function Instructions() {
    return <div className="my-2">
        Enter the question above, using the <code>Add inline question part</code> button to add a new question part at your cursor position in the content.
        Alternatively, you can add an inline question part manually (see below). 
        <details>
            <summary>Manual instructions</summary>
            First, represent any inline question part in the content with <code>[inline-question:id]</code>. 
            Then, add a new inline question part below, setting the question ID to be <code>inline-question:id</code> (without the square brackets!). 
            These will then link automatically.
        </details>
    </div>;
}

export function InlinePartsPresenter(props: PresenterProps<IsaacInlineQuestion>) {
    return <Box name="Inline Parts">
        <Instructions />
        <ListPresenterProp {...props}
            prop="inlineQuestions"
            childTypeOverride="inlineQuestionPart"
        />
    </Box>;
}

