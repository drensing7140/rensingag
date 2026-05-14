@tailwind base;
@tailwind components;
@tailwind utilities;

/* LIGHT MODE — Agricultural green on warm cream */
:root {
  --button-outline: rgba(0, 0, 0, 0.1);
  --badge-outline: rgba(0, 0, 0, 0.05);
  --opaque-button-border-intensity: -8;
  --elevate-1: rgba(0, 0, 0, 0.03);
  --elevate-2: rgba(0, 0, 0, 0.08);
  /* warm cream background */
  --background: 45 24% 96%;
  --foreground: 100 25% 12%;
  --border: 60 8% 82%;
  --card: 45 25% 98%;
  --card-foreground: 100 25% 12%;
  --card-border: 60 10% 88%;
  --sidebar: 95 18% 92%;
  --sidebar-foreground: 100 25% 14%;
  --sidebar-border: 95 12% 80%;
  --sidebar-primary: 103 56% 31%;
  --sidebar-primary-foreground: 45 25% 98%;
  --sidebar-accent: 95 18% 86%;
  --sidebar-accent-foreground: 100 25% 14%;
  --sidebar-ring: 103 56% 31%;
  --popover: 45 25% 97%;
  --popover-foreground: 100 25% 12%;
  --popover-border: 60 8% 82%;
  /* deep field green */
  --primary: 103 56% 31%;
  --primary-foreground: 45 25% 98%;
  --secondary: 45 18% 90%;
  --secondary-foreground: 100 25% 14%;
  --muted: 45 15% 92%;
  --muted-foreground: 50 8% 38%;
  --accent: 95 25% 86%;
  --accent-foreground: 100 25% 14%;
  --destructive: 0 65% 42%;
  --destructive-foreground: 45 25% 98%;
  --input: 60 8% 75%;
  --ring: 103 56% 31%;
  --chart-1: 103 56% 31%;
  --chart-2: 20 73% 44%;
  --chart-3: 43 74% 49%;
  --chart-4: 183 50% 35%;
  --chart-5: 27 70% 50%;
  /* warm wheat / gold accent for headlines + accents */
  --gold: 42 62% 72%;
  --gold-foreground: 100 25% 12%;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', Menlo, monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0px 2px 0px 0px hsl(0 0% 0% / 0);
  --shadow-xs: 0px 2px 0px 0px hsl(0 0% 0% / 0);
  --shadow-sm: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 1px 2px -1px hsl(0 0% 0% / 0);
  --shadow: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 1px 2px -1px hsl(0 0% 0% / 0);
  --shadow-md: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 2px 4px -1px hsl(0 0% 0% / 0);
  --shadow-lg: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 4px 6px -1px hsl(0 0% 0% / 0);
  --shadow-xl: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 8px 10px -1px hsl(0 0% 0% / 0);
  --shadow-2xl: 0px 2px 0px 0px hsl(0 0% 0% / 0);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

  --sidebar-primary-border: hsl(var(--sidebar-primary));
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border: hsl(var(--sidebar-accent));
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border: hsl(var(--primary));
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border: hsl(var(--secondary));
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border: hsl(var(--muted));
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border: hsl(var(--accent));
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border: hsl(var(--destructive));
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

.dark {
  --button-outline: rgba(255, 255, 255, 0.1);
  --badge-outline: rgba(255, 255, 255, 0.05);
  --opaque-button-border-intensity: 9;
  --elevate-1: rgba(255, 255, 255, 0.04);
  --elevate-2: rgba(255, 255, 255, 0.09);
  --background: 100 12% 8%;
  --foreground: 45 15% 92%;
  --border: 100 8% 20%;
  --card: 100 12% 11%;
  --card-foreground: 45 15% 92%;
  --card-border: 100 8% 18%;
  --sidebar: 100 14% 10%;
  --sidebar-foreground: 45 15% 92%;
  --sidebar-border: 100 8% 18%;
  --sidebar-primary: 97 43% 50%;
  --sidebar-primary-foreground: 100 25% 8%;
  --sidebar-accent: 100 8% 18%;
  --sidebar-accent-foreground: 45 15% 92%;
  --sidebar-ring: 97 43% 50%;
  --popover: 100 12% 13%;
  --popover-foreground: 45 15% 92%;
  --popover-border: 100 8% 20%;
  --primary: 97 43% 50%;
  --primary-foreground: 100 25% 8%;
  --secondary: 100 8% 18%;
  --secondary-foreground: 45 15% 92%;
  --muted: 100 8% 18%;
  --muted-foreground: 45 8% 65%;
  --accent: 100 12% 22%;
  --accent-foreground: 45 15% 92%;
  --destructive: 0 65% 50%;
  --destructive-foreground: 45 15% 95%;
  --input: 100 8% 28%;
  --ring: 97 43% 50%;
  --chart-1: 97 43% 50%;
  --chart-2: 20 65% 55%;
  --chart-3: 43 74% 60%;
  --chart-4: 188 35% 55%;
  --chart-5: 27 70% 60%;
  --shadow-2xs: 0px 2px 0px 0px hsl(0 0% 0% / 0);
  --shadow-xs: 0px 2px 0px 0px hsl(0 0% 0% / 0);
  --shadow-sm: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 1px 2px -1px hsl(0 0% 0% / 0);
  --shadow: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 1px 2px -1px hsl(0 0% 0% / 0);
  --shadow-md: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 2px 4px -1px hsl(0 0% 0% / 0);
  --shadow-lg: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 4px 6px -1px hsl(0 0% 0% / 0);
  --shadow-xl: 0px 2px 0px 0px hsl(0 0% 0% / 0), 0px 8px 10px -1px hsl(0 0% 0% / 0);
  --shadow-2xl: 0px 2px 0px 0px hsl(0 0% 0% / 0);

  --sidebar-primary-border: hsl(var(--sidebar-primary));
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border: hsl(var(--sidebar-accent));
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border: hsl(var(--primary));
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border: hsl(var(--secondary));
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border: hsl(var(--muted));
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border: hsl(var(--accent));
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border: hsl(var(--destructive));
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

@layer base {
  * { @apply border-border; }
  body { @apply font-sans antialiased bg-background text-foreground; }
  .font-display { font-family: var(--font-serif); font-weight: 500; letter-spacing: -0.02em; }
  .font-display-italic { font-family: var(--font-serif); font-style: italic; font-weight: 500; letter-spacing: -0.015em; }
}

@layer utilities {
  input[type='search']::-webkit-search-cancel-button { @apply hidden; }
  [contenteditable][data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
  }
  .no-default-hover-elevate {}
  .no-default-active-elevate {}
  .toggle-elevate::before, .toggle-elevate-2::before {
    content: ''; pointer-events: none; position: absolute; inset: 0px;
    border-radius: inherit; z-index: -1;
  }
  .toggle-elevate.toggle-elevated::before { background-color: var(--elevate-2); }
  .border.toggle-elevate::before { inset: -1px; }
  .hover-elevate:not(.no-default-hover-elevate),
  .active-elevate:not(.no-default-active-elevate),
  .hover-elevate-2:not(.no-default-hover-elevate),
  .active-elevate-2:not(.no-default-active-elevate) { position: relative; z-index: 0; }
  .hover-elevate:not(.no-default-hover-elevate)::after,
  .active-elevate:not(.no-default-active-elevate)::after,
  .hover-elevate-2:not(.no-default-hover-elevate)::after,
  .active-elevate-2:not(.no-default-active-elevate)::after {
    content: ''; pointer-events: none; position: absolute; inset: 0px;
    border-radius: inherit; z-index: 999;
  }
  .hover-elevate:hover:not(.no-default-hover-elevate)::after,
  .active-elevate:active:not(.no-default-active-elevate)::after { background-color: var(--elevate-1); }
  .hover-elevate-2:hover:not(.no-default-hover-elevate)::after,
  .active-elevate-2:active:not(.no-default-active-elevate)::after { background-color: var(--elevate-2); }
  .border.hover-elevate:not(.no-hover-interaction-elevate)::after,
  .border.active-elevate:not(.no-active-interaction-elevate)::after,
  .border.hover-elevate-2:not(.no-hover-interaction-elevate)::after,
  .border.active-elevate-2:not(.no-active-interaction-elevate)::after,
  .border.hover-elevate:not(.no-hover-interaction-elevate)::after { inset: -1px; }
}
