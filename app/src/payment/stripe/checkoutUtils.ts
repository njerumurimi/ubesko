import type { StripeMode } from './paymentProcessor';

import Stripe from 'stripe';
import { stripe } from './stripeClient';

// WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp.sh/docs/deploying
const DOMAIN = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

export async function fetchStripeCustomer(customerEmail: string) {
  let customer: Stripe.Customer;
  try {
    const stripeCustomers = await stripe.customers.list({
      email: customerEmail,
    });
    if (!stripeCustomers.data.length) {
      console.log('creating customer');
      customer = await stripe.customers.create({
        email: customerEmail,
      });
    } else {
      console.log('using existing customer');
      customer = stripeCustomers.data[0];
    }
    return customer;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface CreateStripeCheckoutSessionParams {
  priceId: string;
  customerId: string;
  mode: StripeMode;
}

export async function createStripeCheckoutSession({
  priceId,
  customerId,
  mode,
}: CreateStripeCheckoutSessionParams) {
  try {
    return await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${DOMAIN}/checkout?success=true`,
      cancel_url: `${DOMAIN}/checkout?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_update: {
        address: 'auto',
      },
      customer: customerId,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export interface CreateStripeCarRentalCheckoutSessionParams {
  customerId: string;
  carName: string;
  dailyRate: number;
  durationDays: number;
  currency: string;
  userId: string;
  carId: number;
}

/**
 * Used for predefined products (subscriptions or one-time credits)
 */
export async function createStripeCarRentalCheckoutSession({
  customerId,
  carName,
  dailyRate,
  durationDays,
  currency,
  userId,
  carId,
}: CreateStripeCarRentalCheckoutSessionParams) {
  try {

    const totalAmount = dailyRate * durationDays;

    return await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(totalAmount * 100), // convert to cents
            product_data: {
              name: `${carName} rental`,
              description: `Rental for ${durationDays} day${durationDays > 1 ? 's' : ''}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/checkout?success=true`,
      cancel_url: `${DOMAIN}/checkout?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_update: {
        address: 'auto',
      },
      customer: customerId,
      metadata: {
        userId,
        carName,
        carId: carId.toString(),
        durationDays: durationDays.toString(),
        dailyRate: dailyRate.toString(),
        totalAmount: totalAmount.toString(),
        currency,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}