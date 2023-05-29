import { S3 } from "@aws-sdk/client-s3";
import { env } from "@/env.mjs";

export const s3 = new S3({
  apiVersion: "2006-03-01",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_DEFAULT_REGION,
});
