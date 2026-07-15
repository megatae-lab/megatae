import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

export function isAllowedType(contentType: string) {
  return ALLOWED_TYPES.has(contentType);
}

export async function generatePresignedUploadUrl(
  contentType: string,
  folder = "comprobantes"
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const key = `${folder}/${randomUUID()}`;
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );
  return { uploadUrl, publicUrl: `${process.env.R2_PUBLIC_URL}/${key}` };
}
