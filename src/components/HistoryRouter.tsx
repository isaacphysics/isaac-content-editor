import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { History } from "history";
import { Router } from "react-router-dom";

interface CustomRouterProps {
  basename?: string;
  history: History;
}

export const HistoryRouter: FunctionComponent<CustomRouterProps> = ({ basename, children, history }) => {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router basename={basename} location={state.location} navigationType={state.action} navigator={history}>
      {children}
    </Router>
  );
};
