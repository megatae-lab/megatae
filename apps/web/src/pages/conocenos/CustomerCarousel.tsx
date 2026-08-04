import { useState, useEffect, useRef, RefObject } from "react";

const STORES = [
    { name: "CARNICERIA", src: "/assets/carniceria.jpg" },
    { name: "VERDULERIA", src: "/assets/verduleria.jpg" },
    { name: "PUESTOS", src: "/assets/puestos.jpg" },
    { name: "FARMACIA", src: "/assets/farmacia.jpg" },
    { name: "TIENDAS", src: "/assets/tienda.jpg" },
];

export function Carousel() {
    return (
        <section id="Carousel" className="relative bg-navy-900 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br pointer-events-none" />
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #0057ff33 0%, transparent 60%)" }}
            />
            <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-7 flex flex-col items-center justify-center text-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-center">
                    <div className="flex justify-center order-2 md:order-1">
                        <MapImage />
                    </div>

                    <div className="order-1 md:order-2 grid grid-cols-3 gap-2 sm:gap-4">
                        <StatCard value={100} suffix="k" label="Transacciones diarias" delay={0} />
                        <StatCard value={2} suffix="k" label="Clientes satisfechos" delay={150} />
                        <StatCard value={1} suffix="k" label="Descargas en playstore" delay={300} />
                    </div>
                </div>
            </div>

            {/* Banner inferior */}
            <CtaBanner text="Únete a Megatae" />
            <div className="bg-[url('/assets/banner-carousel.png')] bg-cover bg-center py-8 sm:py-10 md:py-12 px-4 overflow-hidden">
                <div className="mx-auto max-w-7xl text-center">

                    <div className="relative overflow-hidden">
                        <div className="flex w-max animate-marquee">
                            <div className="flex items-center gap-6 sm:gap-8 md:gap-10 shrink-0 px-5">
                                {STORES.map((s) => (
                                    <img
                                        key={s.name}
                                        src={s.src}
                                        alt={s.name}
                                        className="block h-24 w-24 sm:h-40 sm:w-40 md:h-56 md:w-56 lg:h-75 lg:w-75 object-contain"
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-6 sm:gap-8 md:gap-10 shrink-0 px-5" aria-hidden="true">
                                {STORES.map((s) => (
                                    <img
                                        key={s.name + "-dup"}
                                        src={s.src}
                                        alt=""
                                        className="block h-24 w-24 sm:h-40 sm:w-40 md:h-56 md:w-56 lg:h-75 lg:w-75 object-contain"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <h1 className="text-lg sm:text-8xl md:text-4xl lg:text-4xl font-black text-white mt-5 sm:mt-7 leading-tight px-2">
                        Ellos ya multiplicaron sus ingresos. <span className="text-brand-light">¿Tú que esperas?</span>
                    </h1>
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
                    `}
                </style>
            </div>

            <CtaBanner text="Lleva tu negocio al siguiente nivel" />
        </section>
    );
}

function MapImage() {
    const ref = useRef<HTMLImageElement>(null);
    const [visible, setVisible] = useState(false);
    const [offset, setOffset] = useState(0);
    const rafId = useRef<number | undefined>(undefined);
    const smoothOffset = useRef(0);
    const targetOffset = useRef(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.2 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const computeTarget = () => {
            const rect = el.getBoundingClientRect();
            const viewportH = window.innerHeight;
            const centerProgress = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
            const clamped = Math.max(-1, Math.min(1, centerProgress));
            targetOffset.current = clamped * -70;
        };

        const tick = () => {
            smoothOffset.current += (targetOffset.current - smoothOffset.current) * 0.12;
            setOffset(smoothOffset.current);
            rafId.current = requestAnimationFrame(tick);
        };

        const handleScroll = () => computeTarget();

        computeTarget();
        rafId.current = requestAnimationFrame(tick);
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    const scale = 1 + (1 - Math.min(1, Math.abs(offset) / 70)) * 0.04;

    return (
        <img
            ref={ref}
            src="/assets/map.png"
            alt=""
            className="w-full max-w-70 sm:max-w-sm md:max-w-md lg:max-w-lg h-auto"
            style={{
                opacity: visible ? 1 : 0,
                transform: `translateY(${visible ? offset : 40}px) scale(${scale})`,
                transition: "opacity 0.7s ease-out",
                willChange: "transform, opacity",
            }}
        />
    );
}

interface UseCountUpOptions {
    duration?: number;
}

function useCountUp(
    target: number,
    { duration = 1600 }: UseCountUpOptions = {}
): [number, RefObject<HTMLDivElement | null>] {
    const [value, setValue] = useState<number>(0);
    const [started, setStarted] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;

        let startTime: number | null = null;
        let frameId: number;

        const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = easeOutQuint(progress);
            setValue(target * eased);
            if (progress < 1) {
                frameId = requestAnimationFrame(step);
            } else {
                setValue(target);
            }
        };

        frameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameId);
    }, [started, target, duration]);

    return [value, ref];
}

interface StatCardProps {
    value: number;
    suffix: string;
    label: string;
    delay?: number;
}

function StatCard({ value, suffix, label, delay = 0 }: StatCardProps) {
    const [animatedValue, ref] = useCountUp(value, { duration: 1600 });
    const display = Math.round(animatedValue);

    return (
        <div
            ref={ref}
            className="rounded-2xl px-3 py-4 sm:px-5 sm:p-36 md:px-6 md:py-14 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/30 transition-transform duration-300 hover:-translate-y-1"
            style={{
                background: "linear-gradient(160deg, #1E88FF 0%, #1467E0 100%)",
                animationDelay: `${delay}ms`,
            }}
        >
            <span className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#0B1E3F] tracking-tight leading-none">
                +{display}
                {suffix}
            </span>
            <span className="mt-2 text-xs sm:text-sm md:text-[15px] font-medium text-white leading-snug">
                {label}
            </span>
        </div>
    );
}

function CtaBanner({ text }: { text: string }) {
    return (
        <div className="relative z-10 bg-brand py-2 text-center px-4">
            <button
                onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                className="text-white text-xs sm:text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
            >
                {text}
            </button>
        </div>
    );
}