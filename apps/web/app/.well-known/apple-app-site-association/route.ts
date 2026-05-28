export const dynamic = "force-static";

const BUNDLE_ID = "digital.shineup.appcn";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  return Response.json({
    applinks: teamId
      ? {
          details: [
            {
              appIDs: [`${teamId}.${BUNDLE_ID}`],
              components: [{ "/": "/components/*" }],
            },
          ],
        }
      : { details: [] },
  });
}
