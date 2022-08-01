# Development

## Provider Account Setup

You will need to have a wazuh server in order to test against a live backend. If
you are on an x86 machine, you can
[set up an environment](https://documentation.wazuh.com/current/deployment-options/docker/index.html)
on your machine using Docker.

Otherwise, you can use Wazuh's All-In-One Amaon Machine Image (AMI) to
[stand up a server in your AWS account](https://documentation.wazuh.com/current/deployment-options/amazon-machine-images/amazon-machine-images.html).
If you are deploying this in your org's VPC only for testing purposes, we'd
recommend only allowing inbound traffic from within your VPC (assuming you can
tunnel into it via VPN), and not exposing a public IP. The default Security
Group settings for the Marketplace AMI are overly permissive.

Once you have a wazuh server up, you can
[install](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/index.html)
and register an agent to start populating your server with data.

Finally, we recommend creating a user in your Wazuh account (we call ours
`api-access`) with `readonly` permissions for the integration to use. You can
set up a user by going to `Security -> Users -> Create User` in your Wazuh
Dashboard. We do not recommend using your admin credentials in your integration
configuration.

You will need to add the following to a `.env` file in the root directory of
this project in order to run this integration against your wazuh server:

```
USERNAME: a user in your wazuh account that has readonly permission
PASSWORD: password for that user
MANAGER_URL: `https://${ip_of_wazuh_server}:55000`
```

> :warning: **If you are testing against a wazuh server using an self-signed
> cert**: You must modify `src/config.ts` such that the wazuh client is
> configured to support self-signed certs.

```javascript
await wazuhClient.configure({
  username: config.username,
  password: config.password,
  managerUrl: config.managerUrl,
  selfSignedCert: true,
});
```
