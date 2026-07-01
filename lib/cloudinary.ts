import { v2 as cloudinary } from "cloudinary";

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
  return cloudinary;
}

export default cloudinary;

export async function uploadFile(
  buffer: Buffer,
  options: {
    folder:   string;
    filename: string;
    type:     string;
  }
): Promise<{ url: string; publicId: string; bytes: number }> {
  const cld = getCloudinary();

  // Convert buffer to base64 data URI
  const base64 = buffer.toString("base64");
  const dataUri = `data:application/octet-stream;base64,${base64}`;

  const result = await cld.uploader.upload(dataUri, {
    folder:        "bracustream",
    resource_type: "auto",
  });

  return {
    url:      result.secure_url,
    publicId: result.public_id,
    bytes:    result.bytes,
  };
}

export function getSignedUrl(publicId: string): string {
  const cld = getCloudinary();
  return cld.url(publicId, {
    resource_type: "auto",
    sign_url:      true,
    expires_at:    Math.floor(Date.now() / 1000) + 3600,
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  const cld = getCloudinary();
  await cld.uploader.destroy(publicId, { resource_type: "auto" });
}