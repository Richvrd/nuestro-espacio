"use server";
import { createClient } from "@/lib/supabase/server";
import { COUPLE } from "@/lib/constants";

function monthsSince(start: Date, now: Date): number {
  let m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) m--;
  return Math.max(0, m);
}

export async function checkAndClaimAnniversaryEvent(
  userName: string
): Promise<{ shouldFire: boolean; monthNumber: number }> {
  const supabase = await createClient();

  const start = new Date(COUPLE.startDate);
  const now = new Date();
  const monthsElapsed = monthsSince(start, now);

  if (monthsElapsed === 0) return { shouldFire: false, monthNumber: 0 };

  const triggeredAt = new Date(start);
  triggeredAt.setMonth(triggeredAt.getMonth() + monthsElapsed);
  const expiresAt = new Date(+triggeredAt + 5 * 24 * 60 * 60 * 1000);

  const { error: upsertError } = await supabase
    .from("anniversary_events")
    .upsert(
      {
        month_number: monthsElapsed,
        triggered_at: triggeredAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "month_number", ignoreDuplicates: true }
    );

  if (upsertError) return { shouldFire: false, monthNumber: 0 };

  const { data: event } = await supabase
    .from("anniversary_events")
    .select("*")
    .eq("month_number", monthsElapsed)
    .single();

  if (!event) return { shouldFire: false, monthNumber: 0 };

  if (now > new Date(event.expires_at)) {
    return { shouldFire: false, monthNumber: monthsElapsed };
  }

  if (event.seen_by?.includes(userName)) {
    return { shouldFire: false, monthNumber: monthsElapsed };
  }

  await supabase
    .from("anniversary_events")
    .update({ seen_by: [...(event.seen_by ?? []), userName] })
    .eq("month_number", monthsElapsed);

  return { shouldFire: true, monthNumber: monthsElapsed };
}
