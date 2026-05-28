export const dynamic = "force-static";

const PACKAGE_NAME = "digital.shineup.appcn";

export function GET() {
  const fingerprint = process.env.ANDROID_CERT_FINGERPRINT?.trim();
  return Response.json(
    fingerprint
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: PACKAGE_NAME,
              sha256_cert_fingerprints: [fingerprint],
            },
          },
        ]
      : [],
  );
}
