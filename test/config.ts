import * as dotenv from 'dotenv';
import * as path from 'path';
import { WazuhIntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const config: WazuhIntegrationConfig = {
  username: process.env.USERNAME || 'username',
  password: process.env.PASSWORD || 'password',
  managerUrl: process.env.MANAGER_URL || 'https://10.55.123.46:55000',
};
