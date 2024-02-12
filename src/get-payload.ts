import dotenv from "dotenv";
import path from "path";
import payload, { Payload } from "payload";
import type { InitOptions } from "payload/config";
// import nodemailer from 'nodemailer'

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.resend.com",
//   secure: 'true',
//   port: 465,
//   auth: {
//     user: 'resend',
//     pass: process.env.RESEND_API_KEY
//   }
// })

// caching
let cached = (global as any).payload;

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

interface Args {
  initOptions?: Partial<InitOptions>;
}

export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_URL) {
    throw new Error("Payload secret is missing");
  }

  if (cached.client) {
    return cached.client;
  }
  if (!cached.promise) {
    cached.promise = payload.init({
      secret: process.env.PAYLOAD_URL,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (error: unknown) {
    cached.promise = null;
    throw error;
  }

  return cached.client;
};
