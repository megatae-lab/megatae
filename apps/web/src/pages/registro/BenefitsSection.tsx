interface FeatureCardProps {
  image: string;
  alt: string;
  title: string;
  description: string;
}

function FeatureCard({
  image,
  alt,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-sky-400 p-4 text-center transition-all hover:bg-white/10 sm:p-5">
      <img
        src={image}
        alt={alt}
        className="mb-3 h-16 w-16 object-contain sm:h-20 sm:w-20"
      />

      <h3 className="text-sm font-semibold leading-tight text-white sm:text-base">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
        {description}
      </p>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section className="relative overflow-hidden bg-[url('/assets/banner-registro-2.png')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 " />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-12 md:px-10 lg:py-20">
        {/* Texto */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Mantén tu línea activa
            <br />
            sin complicaciones
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-200 sm:text-base md:mx-0">
            Completa tu registro en unos minutos y mantén tu servicio activo
            de forma rápida y segura.
          </p>

          <button className="mt-7 w-full rounded-lg bg-sky-400 px-6 py-3 text-sm font-semibold text-[#0a1e42] transition hover:bg-sky-300 sm:w-auto">
            Regístrate ahora
          </button>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeatureCard
            image="/assets/icon-linea.png"
            alt="Conserva tu línea activa"
            title="Conserva tu línea activa"
            description="Evita interrupciones en tu servicio."
          />

          <FeatureCard
            image="/assets/icon-red.png"
            alt="Sigue conectado"
            title="Sigue conectado"
            description="Continúa usando llamadas, SMS y datos móviles."
          />

          <FeatureCard
            image="/assets/icon-reloj.png"
            alt="Registro en minutos"
            title="Registro en minutos"
            description="Proceso rápido, fácil y desde tu celular."
          />

          <FeatureCard
            image="/assets/icon-seguro.png"
            alt="Proceso oficial y seguro"
            title="Proceso oficial y seguro"
            description="Cumple con la disposición oficial de forma segura."
          />
        </div>
      </div>
      <CtaBanner text="Registra tu línea aquí" />

    </section>
  );
}


function CtaBanner({ text }: { text: string }) {
  return (
    <div className="relative z-10 bg-brand py-2 text-center">
      <button
        onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
        className="text-white text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
      >
        {text}
      </button>
    </div>
  );
}