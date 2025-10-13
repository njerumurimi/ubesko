import * as z from 'zod';
import type { GenerateCheckoutSession, GenerateCarRentalCheckoutSession, GetCustomerPortalUrl } from 'wasp/server/operations';
import { PaymentPlanId, paymentPlans } from '../payment/plans';
import { paymentProcessor } from './paymentProcessor';
import { HttpError } from 'wasp/server';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

export type CheckoutSession = {
  sessionUrl: string | null;
  sessionId: string;
};

const generateCarRentalCheckoutSessionSchema = z.object({
  carId: z.number(),
  carName: z.string(),
  durationDays: z.number().min(1),
  dailyRate: z.number().min(0),
  currency: z.string().default('usd'),
});

type GenerateCarRentalCheckoutSessionInput = z.infer<typeof generateCarRentalCheckoutSessionSchema>;

export const generateCarRentalCheckoutSession: GenerateCarRentalCheckoutSession<
  GenerateCarRentalCheckoutSessionInput,
  { sessionUrl: string | null; sessionId: string }
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to book a car.');
  }

  const userId = context.user.id;
  const userEmail = context.user.email;
  if (!userEmail) {
    // If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.
    throw new HttpError(403, 'User needs an email to make a payment.');
  }

  const args = generateCarRentalCheckoutSessionSchema.parse(rawArgs);

  const { session } = await paymentProcessor.createCarRentalCheckoutSession({
    userId,
    userEmail,
    rentalDetails: args,
    prismaUserDelegate: context.entities.User,
  });

  return { sessionUrl: session.url, sessionId: session.id };
};

const generateCheckoutSessionSchema = z.nativeEnum(PaymentPlanId);

type GenerateCheckoutSessionInput = z.infer<typeof generateCheckoutSessionSchema>;

export const generateCheckoutSession: GenerateCheckoutSession<
  GenerateCheckoutSessionInput,
  CheckoutSession
> = async (rawPaymentPlanId, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  const paymentPlanId = ensureArgsSchemaOrThrowHttpError(generateCheckoutSessionSchema, rawPaymentPlanId);
  const userId = context.user.id;
  const userEmail = context.user.email;
  if (!userEmail) {
    // If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.
    throw new HttpError(403, 'User needs an email to make a payment.');
  }

  const paymentPlan = paymentPlans[paymentPlanId];
  const { session } = await paymentProcessor.createCheckoutSession({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate: context.entities.User,
  });

  return {
    sessionUrl: session.url,
    sessionId: session.id,
  };
};

export const getCustomerPortalUrl: GetCustomerPortalUrl<void, string | null> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  return paymentProcessor.fetchCustomerPortalUrl({
    userId: context.user.id,
    prismaUserDelegate: context.entities.User,
  });
};
