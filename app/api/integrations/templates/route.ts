import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { integrationService } from "@/lib/engines/integration-engine";

// GET /api/integrations/templates - Get integration templates (marketplace)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    // First, check if templates exist in DB
    const where: Record<string, unknown> = { isActive: true };
    if (category) {
      where.category = category;
    }

    let templates = await prisma.integrationTemplate.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // If no templates in DB, seed with built-in templates
    if (templates.length === 0) {
      const builtInTemplates = integrationService.getBuiltInTemplates();

      await prisma.integrationTemplate.createMany({
        data: builtInTemplates.map((t) => ({
          name: t.name,
          provider: t.provider,
          category: t.category,
          description: t.description || null,
          logoUrl: t.logoUrl || null,
          configSchema: t.configSchema as unknown as Prisma.InputJsonValue,
          authType: t.authType,
          endpoints: t.endpoints as unknown as Prisma.InputJsonValue,
          isActive: true,
        })),
        skipDuplicates: true,
      });

      templates = await prisma.integrationTemplate.findMany({
        where,
        orderBy: { name: "asc" },
      });
    }

    // Group by category
    const byCategory = templates.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {} as Record<string, typeof templates>);

    return NextResponse.json({
      templates,
      byCategory,
      categories: Object.keys(byCategory),
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
