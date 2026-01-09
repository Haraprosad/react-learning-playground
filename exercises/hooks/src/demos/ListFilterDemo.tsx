import { useState, useMemo } from "react";

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
}

const ITEMS: Item[] = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999 },
  { id: 2, name: "Phone", category: "Electronics", price: 699 },
  { id: 3, name: "Headphones", category: "Electronics", price: 199 },
  { id: 4, name: "Desk", category: "Furniture", price: 299 },
  { id: 5, name: "Chair", category: "Furniture", price: 199 },
  { id: 6, name: "Monitor", category: "Electronics", price: 399 },
  { id: 7, name: "Keyboard", category: "Electronics", price: 129 },
  { id: 8, name: "Mouse", category: "Electronics", price: 49 },
  { id: 9, name: "Bookshelf", category: "Furniture", price: 149 },
  { id: 10, name: "Lamp", category: "Furniture", price: 79 },
];

/**
 * List Filter Demo - useMemo
 * Demonstrates performance optimization with useMemo
 */
export function ListFilterDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [renderCount, setRenderCount] = useState(0);

  // Trigger re-render to show optimization
  const forceRender = () => setRenderCount((c) => c + 1);

  // EXPENSIVE computation - only recalculates when dependencies change
  const filteredAndSortedItems = useMemo(() => {
    console.log("🔄 Filtering and sorting items... (expensive operation)");

    const result = ITEMS.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.price - b.price;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <section className="demo-section">
      <h2>6. useMemo - List Filter</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Filtering/sorting a
          list is expensive. useMemo caches the result.
        </p>
        <p>
          <strong>✅ With useMemo:</strong> Click "Force Re-render" → List
          doesn't recalculate (cached!). Only recalcs when filters change.
        </p>
        <p>
          <strong>❌ Without useMemo:</strong> Every re-render recalculates the
          list → Waste of CPU! 💸
        </p>
        <p>
          <strong>💡 Use when:</strong> Expensive calculations (filtering big
          lists, complex math).
          <br />
          <strong>🚫 Don't use when:</strong> Simple calculations (adds overhead
          without benefit).
        </p>
      </div>
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
        </select>
        <button
          onClick={() => setSortBy(sortBy === "name" ? "price" : "name")}
          className="btn-secondary"
        >
          Sort by: {sortBy === "name" ? "Name" : "Price"}
        </button>
        <button onClick={forceRender} className="btn-secondary">
          Force Re-render ({renderCount})
        </button>
      </div>
      <div className="item-list">
        <p>
          Found {filteredAndSortedItems.length} items (Open console to see
          optimization)
        </p>
        {filteredAndSortedItems.map((item) => (
          <div key={item.id} className="item-card">
            <strong>{item.name}</strong> - {item.category} - ${item.price}
          </div>
        ))}
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ <code>useMemo(() ={"> expensive_calculation, [deps]"})</code> →
            Runs once, caches result
          </li>
          <li>
            2️⃣ Type in search → Dependency changes → useMemo recalculates list
          </li>
          <li>
            3️⃣ Click "Force Re-render" → Component re-renders BUT useMemo
            returns cached list ✅
          </li>
          <li>
            4️⃣ Check console: Filter only runs when search/category/sort change!
          </li>
          <li>
            💡 Saves CPU by skipping expensive work when dependencies haven't
            changed
          </li>
        </ul>
      </div>
    </section>
  );
}
