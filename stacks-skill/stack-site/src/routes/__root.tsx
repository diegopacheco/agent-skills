import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { SearchBox } from "../components/SearchBox";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <p className="empty">Page not found.</p>,
});

function RootLayout() {
  return (
    <>
      <header className="topbar">
        <Link to="/" search={{ q: "" }} className="brand">
          <span className="brand-mark">S</span>
          Stacks Catalog
        </Link>
        <SearchBox />
        <nav className="top-links">
          <Link to="/" search={{ q: "" }} activeOptions={{ exact: true, includeSearch: false }} activeProps={{ className: "active" }}>
            Catalog
          </Link>
          <Link to="/rules" activeProps={{ className: "active" }}>
            Rules
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
