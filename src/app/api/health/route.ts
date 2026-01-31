import { NextResponse } from "next/server";
import { prisma, isMockDb } from "@/server/db";

export const dynamic = "force-dynamic";

const getBuildMetadata = () => {
  const metadata = {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    commitRef: process.env.VERCEL_GIT_COMMIT_REF,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  };

  const entries = Object.entries(metadata).filter(
    ([, value]) => typeof value === "string" && value.length > 0,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export async function GET() {
  const startTime = Date.now();
  const build = getBuildMetadata();

  try {
    if (isMockDb) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json(
        {
          status: "ok",
          timestamp: new Date().toISOString(),
          ...(build ? { build } : {}),
          checks: {
            database: {
              status: "ok",
              type: "mock",
              responseTime: `${responseTime}ms`,
            },
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    if (!prisma) {
      throw new Error("Prisma client not available");
    }

    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        ...(build ? { build } : {}),
        checks: {
          database: {
            status: "ok",
            type: "postgresql",
            responseTime: `${responseTime}ms`,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        ...(build ? { build } : {}),
        checks: {
          database: {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
