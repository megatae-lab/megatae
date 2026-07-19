const STORES = [
  { name: "OXXO", src: "/assets/store-oxxo.png" },
  { name: "Soriana", src: "/assets/store-soriana.png" },
  { name: "7-Eleven", src: "/assets/store-7eleven.png" },
  { name: "Bodega Aurrera", src: "/assets/store-bodega.png" },
  { name: "Farmacias del Ahorro", src: "/assets/store-farmacias.png" },
  { name: "Chedraui", src: "/assets/store-chedraui.png" },
];

export function StoresSection() {
  return (
    <section className="bg-navy-950 py-12 px-4">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-white/60 text-sm mb-6">Puedes recargar en tu tienda favorita</p>
        <div className="flex items-center justify-center gap-6">
          {STORES.map((s) => (
            <img
              key={s.name}
              src={s.src}
              alt={s.name}
              style={{ display: "block", height: 40, width: 140, objectFit: "contain" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
