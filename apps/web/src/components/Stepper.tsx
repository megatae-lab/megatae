import { Check } from "lucide-react";

export interface StepperTheme {
  circle: string;
  ring: string;   
  label: string;  
  line: string;   
}

const DEFAULT_THEME: StepperTheme = {
  circle: "bg-brand",
  ring: "ring-brand/30",
  label: "text-brand",
  line: "bg-brand",
};

interface StepperProps {
  steps: string[];
  current: number;
  theme?: StepperTheme;
}

export function Stepper({ steps, current, theme }: StepperProps) {
  const t = theme ?? DEFAULT_THEME;

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${done
                    ? `${t.circle} text-white`
                    : active
                      ? `${t.circle} text-white ring-4 ${t.ring}`
                      : "bg-white/10 text-white/40"
                  }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-white" : done ? t.label : "text-white/30"
                  }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-px mx-1 mb-5 transition-colors ${i < current ? t.line : "bg-white/10"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}