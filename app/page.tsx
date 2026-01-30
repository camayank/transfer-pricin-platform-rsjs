import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  BarChart3,
  FolderOpen,
  Calculator,
  Globe,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe Harbour Analysis",
    description:
      "Instant eligibility check against Rule 10TD/10TE/10TF with margin calculations",
  },
  {
    icon: FileText,
    title: "Form 3CEB Generator",
    description:
      "Auto-generate compliant Form 3CEB with 50+ validation rules and e-filing ready JSON",
  },
  {
    icon: BarChart3,
    title: "Comparable Benchmarking",
    description:
      "TNMM analysis with PLI calculations and statistical range determination",
  },
  {
    icon: FolderOpen,
    title: "Master File (3CEAA)",
    description:
      "OECD BEPS-compliant Master File generation with all 5 mandatory parts",
  },
  {
    icon: Calculator,
    title: "PLI Calculator",
    description:
      "OP/OC, OP/OR, Berry Ratio calculations with automatic extraction from financials",
  },
  {
    icon: Globe,
    title: "CbCR Support",
    description:
      "Country-by-Country Report preparation with Form 3CEAD compliance",
  },
];

const stats = [
  { value: "6", label: "TP Modules" },
  { value: "70%", label: "Time Saved" },
  { value: "100%", label: "Compliance" },
];

const steps = [
  { step: 1, title: "Add Client", description: "Enter client and AE details" },
  { step: 2, title: "Import Data", description: "Connect Tally/Zoho or upload" },
  { step: 3, title: "Safe Harbour Check", description: "Auto-eligibility analysis" },
  { step: 4, title: "Benchmarking", description: "PLI & comparable analysis" },
  { step: 5, title: "Generate Forms", description: "Download 3CEB, Master File" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
              <span className="text-sm font-bold text-white">DC</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              DigiComply
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Login
            </Link>
            <Link href="/register">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-mesh relative pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-1.5 text-sm">
              <span className="mr-2 rounded-full bg-[var(--success)] px-2 py-0.5 text-xs text-white">
                NEW
              </span>
              <span className="text-[var(--text-secondary)]">
                India&apos;s first dedicated Transfer Pricing SaaS
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Transfer Pricing Compliance,{" "}
              <span className="text-[var(--accent)]">Automated</span>
            </h1>
            <p className="mb-8 text-lg text-[var(--text-secondary)]">
              The complete platform for CA firms to manage Form 3CEB, Safe
              Harbour analysis, benchmarking studies, and Master File generation
              — all in one place.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  See Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/50 p-8 backdrop-blur-sm">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[var(--accent)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">
              Everything You Need for TP Compliance
            </h2>
            <p className="text-[var(--text-secondary)]">
              Purpose-built tools for every aspect of Transfer Pricing work
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">
              5-Step Compliance Workflow
            </h2>
            <p className="text-[var(--text-secondary)]">
              From client onboarding to e-filing in a streamlined process
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">
                    {step.step}
                  </div>
                  <h4 className="mb-1 font-medium text-[var(--text-primary)]">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-4 hidden h-0.5 w-16 bg-[var(--border-default)] md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-[var(--text-primary)]">
                Why CA Firms Choose DigiComply
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    title: "Save 70% Time",
                    description:
                      "Automate repetitive calculations and form generation",
                  },
                  {
                    icon: CheckCircle,
                    title: "100% Compliant",
                    description:
                      "Built-in validation ensures e-filing readiness",
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    description: "Assign clients, track progress, manage deadlines",
                  },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--success-bg)] text-[var(--success)]">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
              <h3 className="mb-6 text-xl font-semibold text-[var(--text-primary)]">
                Pricing
              </h3>
              <div className="space-y-4">
                {[
                  { plan: "Starter", clients: "10 clients", price: "50,000" },
                  {
                    plan: "Professional",
                    clients: "50 clients",
                    price: "1,50,000",
                    popular: true,
                  },
                  {
                    plan: "Enterprise",
                    clients: "Unlimited",
                    price: "5,00,000",
                  },
                ].map((tier) => (
                  <div
                    key={tier.plan}
                    className={`rounded-lg border p-4 ${
                      tier.popular
                        ? "border-[var(--accent)] bg-[var(--accent-glow)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {tier.plan}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {tier.clients}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        Rs. {tier.price}
                        <span className="text-sm font-normal text-[var(--text-muted)]">
                          /year
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-mesh py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">
            Ready to Automate Your TP Practice?
          </h2>
          <p className="mb-8 text-[var(--text-secondary)]">
            Join 100+ CA firms already using DigiComply for Transfer Pricing
            compliance. Start your free trial today.
          </p>
          <Link href="/register">
            <Button size="lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--accent)]">
                <span className="text-xs font-bold text-white">DC</span>
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                DigiComply - Transfer Pricing SaaS
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              © 2025 DigiComply. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
