import type { PaymentPlan } from './plans';
import type { PaymentsWebhook } from 'wasp/server/api';
import type { MiddlewareConfigFn } from 'wasp/server';
import { PrismaClient } from '@prisma/client';
import { stripePaymentProcessor } from './stripe/paymentProcessor';

export interface CreateCheckoutSessionArgs {
  userId: string;
  userEmail: string;
  paymentPlan: PaymentPlan;
  prismaUserDelegate: PrismaClient['user'];
}

export interface CreateCarRentalCheckoutSessionArgs {
  userId: string;
  userEmail: string;
  rentalDetails: {
    carName: string;
    dailyRate: number;
    durationDays: number;
    currency: string;
    carId: number;
  };
  prismaUserDelegate: PrismaClient['user'];
}

export interface FetchCustomerPortalUrlArgs {
  userId: string;
  prismaUserDelegate: PrismaClient['user'];
};

export interface PaymentProcessor {
  id: 'stripe';

  createCheckoutSession: (args: CreateCheckoutSessionArgs) => Promise<{ session: { id: string; url: string }; }>;
  fetchCustomerPortalUrl: (args: FetchCustomerPortalUrlArgs) => Promise<string | null>;
  createCarRentalCheckoutSession: (args: CreateCarRentalCheckoutSessionArgs) => Promise<{ session: { id: string; url: string } }>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
}

/**
 * Choose which payment processor you'd like to use, then delete the 
 * other payment processor code that you're not using  from `/src/payment`
 */
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
export const paymentProcessor: PaymentProcessor = stripePaymentProcessor;
