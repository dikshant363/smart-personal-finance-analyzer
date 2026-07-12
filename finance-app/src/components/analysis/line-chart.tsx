import { Series } from "@/lib/analysis/types";

export function LineChart({
  series,
  height = 140,
  color = "#6366f1",
}: {
  series: Series;
  height?: number;
  color?: string;
}) {
  const points = series.points;
  if (points.length < 2) {
    return (
      <p className="text-xs text-neutral-400">Not enough data to display trends.</p>
    );
  }

  const svgWidth = 100;
  const svgHeight = height;
  const padTop = 10;
  const padBottom = 24;
  const chartHeight = svgHeight - padTop - padBottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (index: number) =>
    points.length === 1 ? svgWidth / 2 : (index / (points.length - 1)) * svgWidth;
  const toY = (value: number) =>
    padTop + chartHeight - ((value - min) / range) * chartHeight;

  const polyline = points
    .map((p, i) => `${toX(i)},${toY(p.value)}`)
    .join(" ");

  const dots = points.map((p, i) => (
    <circle key={i} cx={toX(i)} cy={toY(p.value)} r="2.5" fill={color} />
  ));

  const firstLabel = points[0].label;
  const lastLabel = points[points.length - 1].label;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />
      {dots}
      <text
        x={toX(0)}
        y={svgHeight - 2}
        textAnchor="start"
        className="text-[10px] fill-neutral-500"
      >
        {firstLabel}
      </text>
      <text
        x={toX(points.length - 1)}
        y={svgHeight - 2}
        textAnchor="end"
        className="text-[10px] fill-neutral-500"
      >
        {lastLabel}
      </text>
    </svg>
  );
}
