import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Link } from "wouter";
import { Lock, ArrowLeft, LogOut } from "lucide-react";
import { RensingLogo } from "@/components/SiteShell";

// PIN is a soft barrier — keeps customers/random visitors out of the crew tools.
// Anyone determined and technical can find this in the bundle; that is acceptable
// for a small farm services portal. Upgrade to real auth if the threat model changes.
const EMPLOYEE_PIN = "7140";
const SESSION_KEY = "ragsess";

type EmployeeAuthCtx = {
  isAuthed: boolean;
  logout: () => void;
};

const Ctx = createContext<EmployeeAuthCtx>({ isAuthed: false, logout: () => {} });
export const useEmployeeAuth = () => useContext(Ctx);

export function EmployeeGate({ children }: { children: React.ReactNode }) {
  // In-memory session only (sandboxed iframes block storage). Also persists
  // across hash route changes within the same tab.
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (window as any)[SESSION_KEY] === true;
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (window as any)[SESSION_KEY] = isAuthed;
  }, [isAuthed]);

  const logout = useCallback(() => {
    setIsAuthed(false);
    setPin("");
    setError("");
    (window as any)[SESSION_KEY] = false;
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.trim() === EMPLOYEE_PIN) {
      setIsAuthed(true);
      setPin("");
      setError("");
    } else {
      setError("That PIN doesn't match. Try again.");
      setPin("");
    }
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" data-testid="link-home-from-gate" className="flex items-center gap-2">
              <RensingLogo className="h-9 w-auto" />
            </Link>
            <Link
              href="/"
              data-testid="link-back-to-site"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover-elevate"
            >
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-2xl font-display">Crew portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the employee PIN to continue.
              </p>
            </div>

            <div className="mt-8">
              <label htmlFor="pin" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Employee PIN
              </label>
              <input
                id="pin"
                data-testid="input-pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="••••"
              />
              {error && (
                <p data-testid="text-pin-error" className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              type="submit"
              data-testid="button-unlock"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover-elevate"
            >
              Unlock crew portal
            </button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Not on the crew? <Link href="/" className="underline-offset-2 hover:underline">Back to the main site</Link>.
            </p>
          </form>
        </main>
      </div>
    );
  }

  return (
    <Ctx.Provider value={{ isAuthed, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const { logout } = useEmployeeAuth();
  return (
    <button
      data-testid="button-logout"
      onClick={logout}
      className={className ?? "hover-elevate inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium"}
    >
      <LogOut className="h-3.5 w-3.5" /> Log out
    </button>
  );
}
