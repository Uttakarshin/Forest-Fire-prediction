import { db, activityTable } from "@workspace/db";

interface LogActivityParams {
  type: string;
  message: string;
  severity: string;
  relatedId?: number | null;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityTable).values({
      type: params.type,
      message: params.message,
      severity: params.severity,
      relatedId: params.relatedId ?? null,
      timestamp: new Date(),
    });
  } catch {
    // Non-critical — don't let activity logging failures crash the app
  }
}
