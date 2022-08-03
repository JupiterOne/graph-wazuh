import {
  createMockIntegrationLogger,
  mutations,
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { WazuhIntegrationConfig } from '../src/config';
import _ from 'lodash';
import { wazuhClient } from '../src/wazuh/client';

export { Recording };

export function setupWazuhRecording(input: SetupRecordingInput) {
  return setupRecording({
    redactedRequestHeaders: ['x-apikeys'],
    ...input,
    mutateEntry: (entry) => {
      redact(entry);
    },
  });
}

export async function configureWazuhClientWithRecording(
  directory: string,
  name: string,
  config: WazuhIntegrationConfig,
) {
  const configurationRecording = setupWazuhRecording({
    directory,
    name,
    options: {
      matchRequestsBy: getWazuhMatchRequestsBy(config),
    },
  });
  await wazuhClient.configure(
    { ...config, selfSignedCert: true },
    createMockIntegrationLogger(),
  );
  await configurationRecording.stop();
}

function redactValuesDeep(obj, keysMap: Map<String, any>) {
  return _.transform(obj, function (result: any, value: any, key: string) {
    // transform to a new object
    const newValue = keysMap.get(key) || value; // if the key is in keysMap use the replacement value, if not use the original key's value
    if (_.isArray(value)) {
      if (keysMap.has(key)) {
        // the key whose value is array is to be redacted, set each element to target redacted value
        result[key] = value.map(() => newValue);
      } else {
        result[key] = redactValuesDeep(value, keysMap); // redact value to handle nested objects/arrays
      }
    } else if (_.isObject(value)) {
      result[key] = redactValuesDeep(value, keysMap); // if value for key is an object, deepRedact it
    } else {
      result[key] = newValue; // neither object or array, set to newValue
    }
  });
}

function redact(entry): void {
  mutations.unzipGzippedRecordingEntry(entry);
  const DEFAULT_REDACT = '[REDACTED]';
  const keysToRedactMap = new Map();
  keysToRedactMap.set('uname', DEFAULT_REDACT);
  keysToRedactMap.set('ip', DEFAULT_REDACT);
  keysToRedactMap.set('registerIP', DEFAULT_REDACT);
  keysToRedactMap.set('token', DEFAULT_REDACT);
  let response = JSON.parse(entry.response.content.text);

  if (response.forEach) {
    // if response is iterable, traverse each
    response.forEach((responseValue, responseIndex) => {
      response[responseIndex] = redactValuesDeep(
        responseValue,
        keysToRedactMap,
      );
    });
  } else {
    // traverse root
    response = redactValuesDeep(response, keysToRedactMap);
  }
  entry.response.content.text = JSON.stringify(response);
}

type MatchRequestsBy =
  Required<SetupRecordingInput>['options']['matchRequestsBy'];

export function getWazuhMatchRequestsBy(
  config: WazuhIntegrationConfig,
  options?: MatchRequestsBy,
): MatchRequestsBy {
  return {
    headers: false,
    url: true,
    ...options,
  };
}
