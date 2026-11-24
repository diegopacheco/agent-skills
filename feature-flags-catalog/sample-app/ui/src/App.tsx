import { useState } from "react";
import { CatalogPage } from "./features/catalog/components/CatalogPage";
import { flags } from "./flags";

type Theme = "light" | "dark";

export function App() {
  const darkModeAvailable = flags.isEnabled("dark-mode");
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <div className={`app theme-${theme}`}>
      <header>
        <h1>Flag Shop</h1>
        {darkModeAvailable && (
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark mode" : "Light mode"}</button>
        )}
      </header>
      <CatalogPage />
    </div>
  );
}
