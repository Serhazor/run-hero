import DayClient from "@/components/day-client";
import { formatLongDate } from "@/lib/plan";

type Props = {
  params: Promise<{ date: string }>;
};

export default async function DayPage({ params }: Props) {
  const { date } = await params;

  return <DayClient dateIso={date} pageTitle={formatLongDate(date)} />;
}