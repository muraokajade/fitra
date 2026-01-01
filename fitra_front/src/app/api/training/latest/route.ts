// app/api/training/latest/route.ts
import { prisma } from "@/lib/prisma";

type ReqBody = { names?: unknown };

type LatestMap = Record<
  string,
  { weight: string; reps: string; sets: string; createdAt: string }
>;

const toIso = (d: unknown) => (d instanceof Date ? d.toISOString() : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ReqBody;
  const names =
    Array.isArray(body.names) ? body.names.filter((x): x is string => typeof x === "string" && x.length > 0) : [];

  if (names.length === 0) return Response.json({} satisfies LatestMap);

  const rows = await prisma.trainingRow.findMany({
    where: { name: { in: names } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { name: true, weight: true, reps: true, sets: true, createdAt: true },
  });

  const map: LatestMap = {};
  for (const r of rows) {
    if (map[r.name]) continue; // 先に来るのが最新
    map[r.name] = {
      weight: String(r.weight),
      reps: String(r.reps),
      sets: String(r.sets),
      createdAt: toIso(r.createdAt),
    };
  }

  return Response.json(map);
}
