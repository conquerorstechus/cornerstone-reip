export function OsmMap({
  lat,
  lng,
  zoom = 13,
  label,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  label?: string;
}) {
  const d = 0.045 / Math.max(1, zoom / 13);
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <figure className="overflow-hidden ring-1 ring-line">
      <iframe title={label ?? "Map"} src={src} className="h-64 w-full border-0 grayscale-[20%]" />
      {label ? (
        <figcaption className="bg-cream px-3 py-2 text-xs text-taupe">{label}</figcaption>
      ) : null}
    </figure>
  );
}
