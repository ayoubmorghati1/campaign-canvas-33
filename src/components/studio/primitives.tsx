import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientBloom({
  className,
  variant = "violet",
}: {
  className?: string;
  variant?: "violet" | "lime" | "clay" | "mix";
}) {
  if (variant === "mix") {
    return (
      <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
        <div className="bloom-violet absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full opacity-70" />
        <div className="bloom-lime absolute top-10 right-0 h-[360px] w-[360px] rounded-full opacity-60" />
        <div className="bloom-clay absolute -bottom-24 left-1/3 h-[360px] w-[360px] rounded-full opacity-50" />
      </div>
    );
  }
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className={cn("absolute inset-0", variant === "violet" && "bloom-violet", variant === "lime" && "bloom-lime", variant === "clay" && "bloom-clay")} />
    </div>
  );
}

export function GlassCard({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = "ink",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: "ink" | "violet" | "lime" | "clay" | "muted";
  className?: string;
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    ink: "bg-ink text-paper",
    violet: "bg-violet/10 text-violet ring-1 ring-inset ring-violet/20",
    lime: "bg-lime/30 text-ink ring-1 ring-inset ring-lime/60",
    clay: "bg-clay/15 text-clay ring-1 ring-inset ring-clay/30",
    muted: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium font-mono tracking-tight",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusDot({ tone = "lime", pulse = true, className }: { tone?: "lime" | "violet" | "clay" | "muted"; pulse?: boolean; className?: string }) {
  const colors: Record<string, string> = {
    lime: "bg-lime",
    violet: "bg-violet",
    clay: "bg-clay",
    muted: "bg-muted-foreground",
  };
  return (
    <span className={cn("relative inline-flex size-2", className)}>
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", colors[tone])} />}
      <span className={cn("relative inline-flex size-2 rounded-full", colors[tone])} />
    </span>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground", className)}>
      <span className="h-px w-6 bg-current opacity-40" />
      {children}
    </span>
  );
}

type ButtonElProps = ComponentProps<"button"> & { to?: undefined };
type LinkElProps = { to: string } & Omit<ComponentProps<typeof Link>, "to" | "children"> & { children?: ReactNode; className?: string; type?: undefined; onClick?: undefined };

export function PrimaryButton(props: ButtonElProps | LinkElProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-all hover:bg-ink/90 active:scale-[0.98] shadow-soft";
  if ("to" in props && props.to) {
    const { to, className, children, ...rest } = props;
    return (
      <Link to={to} className={cn(base, className)} {...rest}>
        {children}
      </Link>
    );
  }
  const { className, children, ...rest } = props as ButtonElProps;
  return (
    <button className={cn(base, className)} {...rest}>
      {children}
    </button>
  );
}

export function SecondaryButton(props: ButtonElProps | LinkElProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/80 px-5 py-3 text-sm font-medium text-ink transition-all hover:bg-white hover:border-ink/30 active:scale-[0.98]";
  if ("to" in props && props.to) {
    const { to, className, children, ...rest } = props;
    return (
      <Link to={to} className={cn(base, className)} {...rest}>
        {children}
      </Link>
    );
  }
  const { className, children, ...rest } = props as ButtonElProps;
  return (
    <button className={cn(base, className)} {...rest}>
      {children}
    </button>
  );
}

export function ViolePillButton({ children, className, to, ...rest }: { children: ReactNode; className?: string; to?: string } & ComponentProps<"button">) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 shadow-glow";
  if (to) {
    return (
      <Link to={to} className={cn(base, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cn(base, className)} {...rest}>
      {children}
    </button>
  );
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function MotionFadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid size-7 place-items-center rounded-[10px] bg-ink">
        <span className="absolute inset-1 rounded-md bg-gradient-to-br from-violet to-lime opacity-90" />
        <span className="relative size-2 rounded-full bg-paper" />
      </span>
      <span className="font-serif text-[19px] tracking-tight">Campaign Studio</span>
    </span>
  );
}