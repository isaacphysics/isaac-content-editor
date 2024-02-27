import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Container } from "reactstrap";

export const buildPageError = (file: string | undefined) =>
  function PageError({ error, resetErrorBoundary }: FallbackProps) {
    return (
      <Container className={"my-5 bg-light overflow-auto"}>
        <div className={"pt-3 sticky-top bg-light"}>
          <h1 className={"w-100"}>
            Error <span className={"float-right"}>&#9888;&#128679;</span>
          </h1>
          <hr />
          <p>
            An error occurred when opening or editing file: <code>{file}</code>
          </p>
          <p>
            Please select another file from the left menu, or you can try to{" "}
            <button
              role="link"
              className={"bg-transparent border-0 p-0 m-0 btn-link"}
              tabIndex={0}
              onClick={resetErrorBoundary}
            >
              reload
            </button>
          </p>
        </div>
        <pre>{error.stack}</pre>
      </Container>
    );
  };
