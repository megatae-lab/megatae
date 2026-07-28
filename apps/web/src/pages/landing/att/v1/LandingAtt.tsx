import { Hero } from "./HeroAtt.js";
import { PlanesSectionAtt } from "./PlanesSectionAtt.js";
import { LeadMagnet } from "../../LeadMagnet.js";
import { HowToSection } from "../../HowToSection.js";
import { BenefitsSection } from "../../BenefitsSection.js";
import { DevicesSection } from "../../DevicesSection.js";
import { StoresSection } from "../../StoresSection.js";

function CtaBanner() {
    return (
        <div className="bg-brand py-2 text-center">
            <button
                onClick={() =>
                    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-white text-sm font-medium underline underline-offset-2 hover:text-white/80 transition-colors"
            >
                Activa tu eSIM con tu compañía favorita
            </button>
        </div>
    );
}

export function LandingAtt() {
    return (
        <>
            <Hero />
            <PlanesSectionAtt />
            <LeadMagnet />
            <HowToSection />
            <BenefitsSection />
            <CtaBanner />
            <DevicesSection />
            <StoresSection />
        </>
    );
}
