import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Phone, MessageSquare, Menu, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

export const PHONE = "(217) 416-7992";
export const PHONE_TEL = "tel:+12174167992";
export const PHONE_SMS = "sms:+12174167992";
export const EMAIL = "drensing@rensingag.com";
export const EMAIL_MAILTO = "mailto:drensing@rensingag.com";

const navItems = [
  { href: "/#services", label: "Services" },
  { href: "/#service-area", label: "Service Area" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

function scrollToHash(hash: string) {
  // hash like "#services" — scroll to element after navigation
  const id = hash.replace(/^#/, "");
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();

  const handleNav = (href: string) => {
    setOpen(false);
    const [path, hash] = href.split("#");
    const target = path || "/";
    if (location !== target) {
      navigate(target);
      if (hash) scrollToHash(hash);
    } else if (hash) {
      scrollToHash(hash);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          data-testid="link-home"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2"
        >
          <img
            src={logoDark}
            alt="Rensing Ag Services LLC"
            className="h-16 w-auto md:h-20 dark:hidden"
          />
          <img
            src={logoLight}
            alt="Rensing Ag Services LLC"
            className="hidden h-16 w-auto md:h-20 dark:block"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => handleNav(item.href)}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={PHONE_TEL}
            data-testid="link-call-header"
            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover-elevate"
          >
            <Phone className="h-4 w-4" />
            Call {PHONE}
          </a>
          <button
            data-testid="button-mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden hover-elevate flex h-10 w-10 items-center justify-center rounded-md border border-border"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleNav(item.href)}
                className="hover-elevate rounded-md px-3 py-2 text-left text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
            <a
              href={PHONE_TEL}
              data-testid="link-call-mobile"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              Call {PHONE}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-[hsl(45_22%_94%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <img src={logoDark} alt="Rensing Ag Services LLC" className="h-24 w-auto dark:hidden" />
            <img src={logoLight} alt="Rensing Ag Services LLC" className="hidden h-24 w-auto dark:block" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Precision aerial spraying for corn and soybean growers across Southern Illinois.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Talk to Dylan</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={PHONE_TEL} data-testid="link-footer-phone" className="inline-flex items-center gap-2 hover:text-primary">
                  <Phone className="h-4 w-4 text-primary" /> {PHONE}
                </a>
              </li>
              <li>
                <a href={PHONE_SMS} data-testid="link-footer-sms" className="inline-flex items-center gap-2 hover:text-primary">
                  <MessageSquare className="h-4 w-4 text-primary" /> Text for a quote
                </a>
              </li>
              <li>
                <a href={EMAIL_MAILTO} data-testid="link-footer-email" className="inline-flex items-center gap-2 hover:text-primary">
                  <Mail className="h-4 w-4 text-primary" /> {EMAIL}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/request" data-testid="link-footer-request" className="hover:text-primary">Request a quote</Link></li>
              <li><Link href="/" data-testid="link-footer-home" className="hover:text-primary">Home</Link></li>
              <li><Link href="/employee" data-testid="link-footer-employee" className="text-muted-foreground hover:text-primary">Employee login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Rensing Ag Services LLC. Family-run, owner-operated.</span>
          <span>Madison County, Illinois</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function RensingLogo({ className }: { className?: string }) {
  return (
    <>
      <img src={logoDark} alt="Rensing Ag Services LLC" className={cn("dark:hidden", className)} />
      <img src={logoLight} alt="Rensing Ag Services LLC" className={cn("hidden dark:block", className)} />
    </>
  );
}
