# Development

## Provider Account Setup

You will need to have a wazuh server in order to test against a live backend.
While this can be done on-prem following
[these instructions](https://documentation.wazuh.com/current/installation-guide/wazuh-server/index.html)
it is much easier to use
[Wazuh Cloud](https://documentation.wazuh.com/current/cloud-service/getting-started/index.html).

### Wazuh Cloud Instructions (WIP)

- sign up for a trial (or login to existing trial if you have it) and
  [create an environment](https://documentation.wazuh.com/current/cloud-service/getting-started/sign-up-trial.html#create-environment)
- view your new environment at
  `https://console.cloud.wazuh.com/console/environments/${environmentId}` and
  get the `default credentials` so you can log in.
- log into your new environment and
  [register agents](https://documentation.wazuh.com/current/cloud-service/getting-started/register-agents.html)
  and generate other test data you desire.
- while you will be able to use the Wazuh Api inside of your cloud environment,
  [it is not exposed by default](https://documentation.wazuh.com/4.3/cloud-service/your-environment/technical-faq.html#do-i-have-access-to-wazuh-api).
  You will need to reach out to support in your cloud console to have them to
  enable api exposure. They will ask for IPs to whitelist. Recommended you
  supply IPs of NATs if you are looking to hit this cloud environment from
  within private subnets of a VPC of your own. The IP they provide you is your
  `MANAGER_URL`

username: cloud environment admin username password: cloud environment admin
password manager_url: ip provided from wazuh support
