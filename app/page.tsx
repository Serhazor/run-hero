import DayClient from "@/components/day-client";
import { formatLongDate, getTodayIsoInTimezone } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const todayIso = getTodayIsoInTimezone();

  return <DayClient dateIso={todayIso} pageTitle={formatLongDate(todayIso)} />;
}