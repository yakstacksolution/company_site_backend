import fs from 'fs/promises';
import path from 'path';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const configured = () => Boolean(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);

const client = () => new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
});

const localPrivateDir = () => path.resolve(process.cwd(), process.env.PRIVATE_UPLOAD_DIR || 'private-uploads');

export const usesObjectStorage = configured;

export const putPublicObject = async ({ key, body, contentType }) => {
  await client().send(new PutObjectCommand({ Bucket: process.env.S3_PUBLIC_BUCKET, Key: key, Body: body, ContentType: contentType }));
  const base = (process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_PUBLIC_BUCKET}`).replace(/\/$/, '');
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
};

export const listPublicObjects = async () => {
  const result = await client().send(new ListObjectsV2Command({ Bucket: process.env.S3_PUBLIC_BUCKET, Prefix: 'media/' }));
  const base = (process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_PUBLIC_BUCKET}`).replace(/\/$/, '');
  return (result.Contents || []).map((item) => ({ filename: item.Key.replace(/^media\//, ''), key: item.Key, url: `${base}/${item.Key}`, size: item.Size, uploadedAt: item.LastModified }));
};

export const deletePublicObject = async (key) => client().send(new DeleteObjectCommand({ Bucket: process.env.S3_PUBLIC_BUCKET, Key: key.startsWith('media/') ? key : `media/${key}` }));

export const putPrivateObject = async ({ key, body, contentType }) => {
  if (configured()) {
    await client().send(new PutObjectCommand({ Bucket: process.env.S3_PRIVATE_BUCKET, Key: key, Body: body, ContentType: contentType }));
    return;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Private object storage is not configured');
  const target = path.join(localPrivateDir(), key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body, { mode: 0o600 });
};

export const deletePrivateObject = async (key) => {
  if (configured()) {
    await client().send(new DeleteObjectCommand({ Bucket: process.env.S3_PRIVATE_BUCKET, Key: key }));
    return;
  }
  await fs.unlink(path.join(localPrivateDir(), key)).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
};

export const privateObjectUrl = async (key) => {
  if (configured()) {
    return getSignedUrl(client(), new GetObjectCommand({ Bucket: process.env.S3_PRIVATE_BUCKET, Key: key }), { expiresIn: 300 });
  }
  return null;
};

export const privateObjectPath = (key) => path.join(localPrivateDir(), key);
