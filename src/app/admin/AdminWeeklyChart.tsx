"use client";

type Point = { x: number; y: number };
type Row = { day: string; users: number; listings: number; messages: number };

type Props = {
  data: Row[];
};

/* Basit bir line-chart (SVG) – Recharts yok, SSR sorunu yok */
export default function AdminWeeklyChart({ data }: Props) {
  const safe = Array.isArray(data) ? data : [];

  // Ölçekleme
  const W = 920;           // çizim genişliği
  const H = 260;           // çizim yüksekliği
  const P = 32;            // padding
  const innerW = W - P * 2;
  const innerH = H - P * 2;

  const maxY =
    safe.length > 0
      ? Math.max(
          10,
          ...safe.map((d) => Math.max(d.users, d.listings, d.messages))
        )
      : 10;

  const xStep = safe.length > 1 ? innerW / (safe.length - 1) : innerW;

  const toPoints = (key: keyof Row): Point[] =>
    safe.map((d, i) => {
      const x = P + i * xStep;
      const y = P + innerH * (1 - (d[key] as number) / maxY);
      return { x, y };
    });

  const path = (pts: Point[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const usersPts = toPoints("users");
  const listingsPts = toPoints("listings");
  const messagesPts = toPoints("messages");

  const gridY = 4; // yatay ızgara çizgisi
  const ticksY = Array.from({ length: gridY + 1 }, (_, i) => {
    const v = (maxY / gridY) * i;
    const y = P + innerH * (1 - v / maxY);
    return { v: Math.round(v), y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[300px]">
        {/* Kenarlık */}
        <rect x={P} y={P} width={innerW} height={innerH} fill="#fff" stroke="#e5e7eb" />

        {/* Yatay ızgaralar + Y ekseni etiketleri */}
        {ticksY.map((t, idx) => (
          <g key={idx}>
            <line
              x1={P}
              y1={t.y}
              x2={P + innerW}
              y2={t.y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
            <text
              x={P - 8}
              y={t.y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#6b7280"
            >
              {t.v}
            </text>
          </g>
        ))}

        {/* X ekseni etiketleri */}
        {safe.map((d, i) => {
          const x = P + i * xStep;
          return (
            <text
              key={i}
              x={x}
              y={P + innerH + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {d.day}
            </text>
          );
        })}

        {/* Çizgiler */}
        <path d={path(usersPts)} fill="none" stroke="#3b82f6" strokeWidth={2} />
        <path d={path(listingsPts)} fill="none" stroke="#22c55e" strokeWidth={2} />
        <path d={path(messagesPts)} fill="none" stroke="#f97316" strokeWidth={2} />

        {/* Noktalar */}
        {usersPts.map((p, i) => (
          <circle key={`u${i}`} cx={p.x} cy={p.y} r={2.5} fill="#3b82f6" />
        ))}
        {listingsPts.map((p, i) => (
          <circle key={`l${i}`} cx={p.x} cy={p.y} r={2.5} fill="#22c55e" />
        ))}
        {messagesPts.map((p, i) => (
          <circle key={`m${i}`} cx={p.x} cy={p.y} r={2.5} fill="#f97316" />
        ))}

        {/* Lejant */}
        <Legend x={P} y={P - 10} />
      </svg>
    </div>
  );
}

function Legend({ x, y }: { x: number; y: number }) {
  const items = [
    { c: "#3b82f6", t: "Kullanıcılar" },
    { c: "#22c55e", t: "İlanlar" },
    { c: "#f97316", t: "Mesajlar" },
  ];
  return (
    <g>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${x + i * 140}, ${y})`}>
          <rect width="14" height="3" y={-6} fill={it.c} rx="1.5" />
          <text x={20} y={-4} fontSize="12" fill="#374151">
            {it.t}
          </text>
        </g>
      ))}
    </g>
  );
}
