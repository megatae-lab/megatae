import { useState, useMemo } from "react";

interface BrandGroup {
  brand: string;
  models: string[];
}

const DEVICE_LIST: BrandGroup[] = [
  {
    brand: "iPhone",
    models: [
      "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
      "iPhone SE 2 (2020)", "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
      "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone SE 3 (2022)",
      "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
      "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
      "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e",
      "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 17e", "iPhone Air",
    ],
  },
  {
    brand: "iPad",
    models: [
      "iPad mini (5.ª gen o posterior)", "iPad mini A17 Pro",
      "iPad (7.ª gen o posterior)", "iPad A16",
      "iPad Air (3.ª gen o posterior)", "iPad Air 11\" M2/M3", "iPad Air 13\" M2/M3",
      "iPad Pro 12.9\" (3.ª gen o posterior)", "iPad Pro 11\" (1.ª gen o posterior, M4, M5)",
      "iPad Pro 13\" M4/M5",
    ],
  },
  {
    brand: "Samsung Galaxy",
    models: [
      "S20", "S20+", "S20 Ultra", "S21", "S21+ 5G", "S21 Ultra 5G",
      "S22", "S22+", "S22 Ultra", "S23", "S23+", "S23 Ultra", "S23 FE",
      "S24", "S24+", "S24 Ultra", "S24 FE", "S25", "S25+", "S25 Ultra", "S25 Edge", "S25 FE",
      "S26", "S26+", "S26 Ultra",
      "Note 20", "Note 20 Ultra 5G",
      "Z Fold", "Z Fold2 5G", "Z Fold3 5G", "Z Fold4", "Z Fold5 5G", "Z Fold6 5G", "Z Fold7",
      "Z Flip", "Z Flip3 5G", "Z Flip4", "Z Flip5 5G", "Z Flip6 5G", "Z Flip7", "Z Flip7 FE",
      "A35", "A36", "A54", "A55 5G", "A56 5G", "XCover 7",
    ],
  },
  {
    brand: "Google Pixel",
    models: [
      "Pixel 2 XL", "Pixel 3", "Pixel 3 XL", "Pixel 3a", "Pixel 3a XL",
      "Pixel 4", "Pixel 4a", "Pixel 4 XL", "Pixel 5", "Pixel 5a",
      "Pixel 6", "Pixel 6a", "Pixel 6 Pro", "Pixel 7", "Pixel 7a", "Pixel 7 Pro",
      "Pixel 8", "Pixel 8a", "Pixel 8 Pro", "Pixel Fold",
      "Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro Fold",
      "Pixel 10", "Pixel 10 Pro", "Pixel 10 Pro XL", "Pixel 10 Fold", "Pixel 10a",
    ],
  },
  {
    brand: "Motorola",
    models: [
      "Razr 2019", "Razr 5G", "Razr 2022", "Razr 40", "Razr 40 Ultra", "Razr+",
      "Razr+ 2024", "Razr 2024", "Razr 60", "Razr 60 Ultra",
      "Edge 2022", "Edge 2023", "Edge+ 2023", "Edge 40", "Edge 40 Pro", "Edge 40 Neo",
      "Edge 50 Pro", "Edge 50 Ultra", "Edge 50 Fusion",
      "Edge 60", "Edge 60 Pro", "Edge 60 Fusion", "Edge 60 Stylus",
      "Moto G Power 5G 2024", "Moto G53", "Moto G54", "Moto G35", "Moto G Stylus 5G 2024",
    ],
  },
  {
    brand: "Xiaomi",
    models: [
      "12T Pro", "13", "13 Lite", "13 Pro", "13T", "13T Pro",
      "14", "14 Pro", "14T", "14T Pro",
      "15", "15 Ultra", "15T", "15T Pro",
      "Redmi Note 13 Pro+", "Redmi Note 14 Pro", "Redmi Note 14 Pro+",
      "Redmi Note 15 Pro", "Redmi Note 15 Pro+", "Poco X7",
    ],
  },
  {
    brand: "Oppo",
    models: [
      "Find X3", "Find X3 Pro", "Find X5", "Find X5 Pro", "Find X8", "Find X8 Pro",
      "Find X9", "Find X9 Pro", "Find N2 Flip", "Find N3", "Find N3 Flip",
      "Reno 5A", "Reno 6 Pro 5G", "Reno 9A", "Reno 14", "Reno 14 Pro", "Reno 15", "Reno 15 Pro",
      "A55s 5G",
    ],
  },
  {
    brand: "Huawei",
    models: ["P40", "P40 Pro", "Mate 40 Pro", "Pura 70", "Pura 70 Pro"],
  },
  {
    brand: "Sony",
    models: [
      "Xperia 10 III Lite", "Xperia 10 IV", "Xperia 10 V",
      "Xperia 1 IV", "Xperia 5 IV", "Xperia 1 V", "Xperia 5 V",
      "Xperia Ace III", "Xperia 1 VI", "Xperia 1 VII",
    ],
  },
  {
    brand: "Honor",
    models: [
      "Magic 4 Pro", "Magic 5 Pro", "Magic 6 Pro", "Magic 7 Pro", "Magic 8 Pro",
      "Magic V2", "Magic V3", "90", "X8", "200 Pro", "400 Lite",
    ],
  },
  {
    brand: "Vivo",
    models: [
      "X80 Pro", "X90 Pro", "X100 Pro", "X200", "X200s", "X200 Pro", "X200 FE",
      "X300", "X300 Pro", "V29", "V29 Lite", "V40", "V40 lite", "V40 SE",
    ],
  },
  {
    brand: "Sharp",
    models: [
      "AQUOS sense4 lite", "AQUOS Sense6s", "AQUOS sense 7", "AQUOS sense 7plus",
      "AQUOS Wish", "AQUOS wish 2 SHG08", "AQUOS wish3", "AQUOS zero 6",
      "AQUOS R7", "AQUOS R8", "AQUOS R8 Pro", "AQUOS sense8",
    ],
  },
  {
    brand: "Otros",
    models: [
      "OnePlus 11", "OnePlus 12", "OnePlus 13", "OnePlus 13R", "OnePlus 13T", "OnePlus 15", "OnePlus Open",
      "Asus ROG Phone 9", "Asus ROG Phone 9 Pro", "Asus Zenfone 12 Ultra",
      "Nothing Phone 3", "Nothing Phone 3a Pro",
      "Realme 14 Pro+", "Realme GT 7", "Realme GT 8 Pro",
      "Nokia XR21", "Nokia X30", "Nokia G60 5G",
      "Rakuten Mini", "Rakuten Big-S", "Rakuten Big", "Rakuten Hand", "Rakuten Hand 5G",
      "Fairphone 4", "Fairphone 5",
    ],
  },
];

export function DevicesSection() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");

  const filtered = useMemo<BrandGroup[]>(() => {
    if (!searched.trim()) return [];
    const words = searched.toLowerCase().split(/\s+/).filter(Boolean);
    return DEVICE_LIST.flatMap((g) => {
      const models = g.models.filter((m) => {
        const text = (g.brand + " " + m).toLowerCase();
        return words.every((w) => text.includes(w));
      });
      return models.length ? [{ brand: g.brand, models }] : [];
    });
  }, [searched]);

  const allMatches = filtered.flatMap((g) => g.models.map((m) => ({ brand: g.brand, model: m })));
  const found = allMatches.length > 0;

  function handleSearch() {
    setSearched(query);
  }

  return (
    <section className="bg-navy-900 py-16 px-4" id="dispositivos">
      <div className="mx-auto max-w-xl">
        <h2 className="text-white font-black text-3xl text-center mb-2">
          ¿Tu dispositivo es compatible?
        </h2>
        <p className="text-white/60 text-center mb-8 text-sm">
          Escribe el modelo de tu teléfono y te decimos al instante.
        </p>

        {/* Buscador */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSearched(""); }}
              placeholder="ej: iPhone 14, Galaxy S23, Pixel 8..."
              className="w-full bg-navy-800 border border-white/20 text-white placeholder-white/40 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-brand hover:bg-brand-dark text-white font-bold px-5 rounded-2xl text-sm transition-colors shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Resultado */}
        {searched.trim() && (
          found ? (
            <div className="flex flex-col items-center gap-3 py-6 px-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-400 font-black text-lg">¡Compatible con eSIM!</p>
                <p className="text-white/70 text-sm mt-1">
                  {allMatches.length === 1
                    ? <><span className="text-white font-semibold">{allMatches[0].brand} {allMatches[0].model}</span> es compatible.</>
                    : <>{allMatches.length} modelos encontrados para <span className="text-white font-semibold">"{query}"</span>.</>
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 px-6 bg-white/5 border border-white/10 rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-white/80 font-bold text-base">No encontramos ese modelo</p>
                <p className="text-white/50 text-sm mt-1">
                  Puede ser compatible de todas formas.{" "}
                  <a href="https://wa.me/521XXXXXXXXXX" className="text-brand underline">Contáctanos</a> para confirmarlo.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
