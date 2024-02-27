import React from "react";

import { AnvilApp } from "../../../isaac-data-types";

import { PresenterProps } from "../registry";
import { Alert } from "reactstrap";

export function AnvilAppPresenter({ doc }: PresenterProps<AnvilApp>) {
  return (
    <>
      <Alert color="secondary">App height will be correct on live pages.</Alert>
      <iframe
        title="Anvil app"
        style={{ width: "100%", height: "300px" }}
        src={"https://" + doc.appId + ".anvil.app/" + doc.appAccessKey}
      />
    </>
  );
}
