import React, { useEffect, useState } from "react";
import {
  Flex,
  Typography,
  Paragraph,
  TextField,
  Button,
} from "@contentful/forma-36-react-components";
import { FieldExtensionSDK } from "@contentful/app-sdk";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

interface EnclosureData {
  url: string;
  type: string;
  length: string;
}

interface InstanceParameters {
  pathFieldId?: string;
}

const Field = (props: FieldProps) => {
  const { sdk } = props;

  const { instance: instanceParameters }: any = sdk.parameters;
  const { pathFieldId }: InstanceParameters = instanceParameters;

  const useSeparatePathField = !!pathFieldId;

  const pathField = pathFieldId ? sdk.entry.fields[pathFieldId] : undefined;

  const [working, setWorking] = useState(false);
  const [enclosureData, setEnclosureData] = useState<EnclosureData>(
    sdk.field.getValue()
  );

  useEffect(() => {
    if (pathField && (!enclosureData || !enclosureData?.url)) {
      fetchAndSetEnclosureData(pathField.getValue());
    }
  }, []);

  useEffect(() => {
    if (pathField) {
      const detach = pathField.onValueChanged(async (value) => {
        fetchAndSetEnclosureData(value, true);
      });
      return () => detach();
    }
  }, [pathField]);

  const fetchAndSetEnclosureData = async function (
    url: string,
    forceRefresh: boolean = false
  ) {
    if (!forceRefresh && url === enclosureData?.url) {
      return;
    }

    setEnclosureData({
      url,
      length: "",
      type: "",
    });

    if (!url.length) {
      return;
    }

    setWorking(true);

    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        setEnclosureData((enclosureData) => ({
          ...enclosureData,
          length: response.headers.get("content-length") ?? "",
          type: response.headers.get("content-type") ?? "",
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch resource "${url}"`, error);
    }

    setWorking(false);
  };

  return (
    <Flex
      flexDirection="column"
      marginTop="spacingS"
      marginLeft="spacing2Xs"
      marginRight="spacingS"
    >
      {useSeparatePathField ? (
        <Typography>
          <Paragraph>
            <b>URL</b>: {enclosureData?.url}
          </Paragraph>
        </Typography>
      ) : (
        <TextField
          id="enclosureURL"
          name="enclosureURL"
          labelText="URL"
          value={enclosureData?.url}
          onChange={(evt) => fetchAndSetEnclosureData(evt.target.value)}
        />
      )}
      <Flex
        flexDirection="row"
        marginTop={useSeparatePathField ? "none" : "spacingM"}
        marginRight="spacingXl"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography>
          <Paragraph>
            <b>Type</b>: {enclosureData?.type}
          </Paragraph>
          <Paragraph>
            <b>Length</b>: {enclosureData?.length}
          </Paragraph>
        </Typography>
        <Button
          buttonType="muted"
          loading={working}
          disabled={working}
          onClick={() => fetchAndSetEnclosureData(enclosureData?.url, true)}
        >
          {working ? "Refreshing..." : "Refresh"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default Field;
