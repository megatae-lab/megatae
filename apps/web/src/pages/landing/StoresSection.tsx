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
    <section className="bg-navy-950 py-12 px-4 overflow-hidden">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-white/70 text-lg mb-6">Puedes recargar en tu tienda favorita</p>

        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee">
            <div className="flex items-center gap-10 shrink-0 px-5">
              {STORES.map((s) => (
                <img
                  key={s.name}
                  src={s.src}
                  alt={s.name}
                  style={{ display: "block", height: 40, width: 140, objectFit: "contain" }}
                />
              ))}
            </div>
            <div className="flex items-center gap-10 shrink-0 px-5" aria-hidden="true">
              {STORES.map((s) => (
                <img
                  key={s.name + "-dup"}
                  src={s.src}
                  alt=""
                  style={{ display: "block", height: 40, width: 140, objectFit: "contain" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
