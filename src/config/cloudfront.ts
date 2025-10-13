// CloudFront configuration
export const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || ''; // Must be set via environment variable

export const getCloudFrontUrl = (s3Key: string): string => {
  // If CloudFront domain is not configured, fall back to S3
  if (!CLOUDFRONT_DOMAIN) {
    console.warn('CloudFront domain not configured, falling back to S3');
    return getS3Url(s3Key);
  }
  
  // Remove the bucket path prefix if it exists
  const cleanKey = s3Key.replace('henna-uploads/', '');
  return `https://${CLOUDFRONT_DOMAIN}/${cleanKey}`;
};

export const getS3Url = (s3Key: string): string => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
};
