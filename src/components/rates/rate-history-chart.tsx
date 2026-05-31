"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { LineChart as LineChartIcon } from "lucide-react";
import { money } from "@/lib/format";
import type { FxRate } from "@/lib/types/rate";

function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function RateHistoryChart({
  snapshots,
  fiatCurrency = "NGN",
}: {
  snapshots: FxRate[];
  fiatCurrency?: string;
}) {
  const data = useMemo(
    () =>
      [...snapshots]
        .reverse()
        .map((s) => ({
          time: format(parseISO(s.fetchedAt), "dd MMM HH:mm"),
          buyRate: Number(s.buyRate),
          sellRate: Number(s.sellRate),
        })),
    [snapshots],
  );

  if (data.length === 0) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="No rate history"
        description="Add an FX rate to start charting the buy/sell spread."
        className="py-12"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={compactNumber}
        />
        <Tooltip
          formatter={(value, name) => [
            money(Number(value), fiatCurrency),
            name === "buyRate" ? "Buy" : "Sell",
          ]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--popover)",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="buyRate"
          stroke="var(--chart-4)"
          strokeWidth={2}
          dot={false}
          name="buyRate"
        />
        <Line
          type="monotone"
          dataKey="sellRate"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
          name="sellRate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
