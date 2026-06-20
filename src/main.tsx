import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Search, ImageOff, ExternalLink, Loader2 } from "lucide-react";
import { api } from "./shared/api/client";
import type { MetObject } from "./shared/api/types";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function ObjectTile({ id, onSelect }: { id: number; onSelect: (object: MetObject) => void }) {
  const [object, setObject] = React.useState<MetObject | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .object(id, controller.signal)
      .then((response) => setObject(response.object))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  return (
    <button className="tile" type="button" onClick={() => object && onSelect(object)}>
      <span className="tileImage">
        {loading ? (
          <Loader2 className="spin" aria-label="Loading" />
        ) : object?.primaryImageSmall ? (
          <img src={object.primaryImageSmall} alt={object.title ?? "Met object"} />
        ) : (
          <ImageOff aria-label="No image" />
        )}
      </span>
      <span className="tileText">
        <strong>{object?.title ?? "Untitled"}</strong>
        <small>{object?.artistDisplayName ?? object?.department ?? "The Met Collection"}</small>
      </span>
    </button>
  );
}

function App() {
  const [query, setQuery] = React.useState("sunflowers");
  const [selected, setSelected] = React.useState<MetObject | null>(null);
  const debouncedQuery = useDebouncedValue(query);
  const [objectIds, setObjectIds] = React.useState<number[]>([]);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setObjectIds([]);
      return;
    }

    const controller = new AbortController();
    setMessage("");
    api
      .search({ q: debouncedQuery.trim(), hasImages: true }, controller.signal)
      .then((result) => setObjectIds((result.objectIDs ?? []).slice(0, 24)))
      .catch((error) => {
        const text =
          error.kind === "upstream-unavailable"
            ? "The Met's collection data is briefly unavailable. Try again in a moment."
            : "Search failed. Check that the backend is running.";
        setMessage(text);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <main>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p>The Metropolitan Museum of Art</p>
            <h1>Met Curator</h1>
          </div>
          <a href="https://metmuseum.github.io/" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            API
          </a>
        </header>

        <label className="searchBox">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artworks, artists, materials"
            aria-label="Search The Met collection"
          />
        </label>

        {message ? <p className="message">{message}</p> : null}

        <div className="results" aria-live="polite">
          {objectIds.map((id) => (
            <ObjectTile key={id} id={id} onSelect={setSelected} />
          ))}
        </div>
      </section>

      <aside className="detail">
        {selected?.primaryImage ? (
          <img src={selected.primaryImage} alt={selected.title ?? "Selected Met object"} />
        ) : (
          <div className="emptyDetail">
            <ImageOff size={48} />
          </div>
        )}
        <div className="detailText">
          <p>{selected?.objectDate ?? selected?.department ?? "Select an object"}</p>
          <h2>{selected?.title ?? "Artwork details"}</h2>
          <dl>
            <dt>Artist</dt>
            <dd>{selected?.artistDisplayName ?? "Unknown"}</dd>
            <dt>Culture</dt>
            <dd>{selected?.culture ?? selected?.period ?? "Not listed"}</dd>
          </dl>
        </div>
      </aside>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
