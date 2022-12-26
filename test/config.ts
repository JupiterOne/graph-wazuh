import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const config: IntegrationConfig = {
  username: process.env.USERID || 'username',
  password: process.env.PASSWORD || 'password',
  managerUrl: process.env.MANAGER_URL || 'https://10.55.123.46:55000',
};
