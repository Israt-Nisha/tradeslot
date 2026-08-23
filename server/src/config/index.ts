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
  whatsapp_access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsapp_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsapp_verify_token: process.env.WHATSAPP_VERIFY_TOKEN || 'tradeslot_verify_token_123',
};

