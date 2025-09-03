import Stripe from 'stripe';
import config from '@config/index';
import AppError from '@shared/utils/appError';

if (!config.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set. Stripe will not function.');
  throw new AppError('Stripe secret key not configured.', 500);
}

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', 
  typescript: true,
});

export default stripe;