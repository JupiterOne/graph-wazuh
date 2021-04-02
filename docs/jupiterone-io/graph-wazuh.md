# Wazuh

## Overview

JupiterOne provides a managed integration with [Wazuh][1]. The integration
connects directly to Wazah Manager APIs to obtain agent information. Customers
authorize access to their self-hosted servers by providing the manager base URL
and a username and password to JupiterOne.

## Wazuh + JupiterOne Integration Benefits

- Visualize Wazuh endpoint agents and the devices they protect in the JupiterOne
  graph.
- Map endpoint agents to devices and devices to the employee who has or owns the
  device.  
- Monitor changes to Digicert endpoint agents and devices using JupiterOne
  alerts.

## How it Works

- JupiterOne periodically fetches Wazuh endpoint agents and devices to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires the Wazuh manager API base URL. JupiterOne also requires 
the username and password to authenticate with the API.
- You must have permission in JupiterOne to install new integrations.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

## Entities

The following entity resources are ingested when the integration runs:

| Example Entity Resource | \_type : \_class of the Entity         |
| ----------------------- | -------------------------------------- |
| Manager                 | `wazuh_manager` : `Service`, `Control` |
| Agent                   | `wazuh_agent` : `HostAgent`            |

## Relationships

The following relationships are created/mapped:

| From            | Type    | To            |
| --------------- | ------- | ------------- |
| `wazuh_manager` | **HAS** | `wazuh_agent` |

[1]: https://wazuh.com
