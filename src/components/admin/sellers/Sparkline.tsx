interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}

export default function Sparkline({
  values,
  color = "#f59e0b",
  height = 28,
  width = 80,
}: SparklineProps) {
  if (values.length === 0) {
    return <div style={{ width, height }} className="opacity-30" />;
  }

  const max = Math.max(...values, 1);
  const step = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const path = `M ${points.join(" L ")}`;
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={`spark-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-grad-${color.replace("#", "")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = i * step;
        const y = height - (v / max) * (height - 4) - 2;
        if (i !== values.length - 1) return null;
        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
}
