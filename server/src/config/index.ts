import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'supersecretkey123',
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '30d',
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_compilation',
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_key_for_compilation',
};
