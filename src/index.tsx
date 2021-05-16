import React from "react";
import { render } from "react-dom";

import { FieldExtensionSDK, init, locations } from "@contentful/app-sdk";
import "@contentful/forma-36-react-components/dist/styles.css";
import "@contentful/forma-36-fcss/dist/styles.css";
import "@contentful/forma-36-tokens/dist/css/index.css";
import "./index.css";

import Field from "./components/Field";

import LocalhostWarning from "./components/LocalhostWarning";

if (process.env.NODE_ENV === "development" && window.self === window.top) {
  const root = document.getElementById("root");
  render(<LocalhostWarning />, root);
} else {
  init((sdk) => {
    const root = document.getElementById("root");

    const ComponentLocationSettings = [
      {
        location: locations.LOCATION_ENTRY_FIELD,
        component: <Field sdk={sdk as FieldExtensionSDK} />,
      },
    ];

    ComponentLocationSettings.forEach((componentLocationSetting) => {
      if (sdk.location.is(componentLocationSetting.location)) {
        render(componentLocationSetting.component, root);
      }
    });
  });
}
