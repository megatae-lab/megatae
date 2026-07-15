const STORES = [
  { name: "OXXO", color: "#ed1c24" },
  { name: "Soriana", color: "#004f9f" },
  { name: "7-Eleven", color: "#007a33" },
  { name: "Farmacias del Ahorro", color: "#e31837" },
  { name: "Chedraui", color: "#009944" },
  { name: "Walmart", color: "#0071ce" },
];

export function StoresSection() {
  return (
    <section className="bg-navy-950 py-12 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-white/60 text-sm mb-6">Puedes recargar en tu tienda favorita</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {STORES.map((s) => (
            <div
              key={s.name}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-bold"
              style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
            >
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
