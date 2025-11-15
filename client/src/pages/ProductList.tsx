import React, { useEffect, useState } from "react";
import { api } from "../api";

type Props = {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
};

export default function ProductList({ onView, onEdit }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.listProducts(q);
      setProducts(res.data ?? res);
    } catch (e) {
      alert(String(e));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={load} disabled={loading} style={{ marginLeft: 8 }}>Search</button>
      </div>
      <div>
        {loading ? <div>Loading...</div> : (
          <ul style={{ paddingLeft: 0 }}>
            {products.length === 0 ? <li>No products</li> : products.map(p => (
              <li key={p._id} style={{ listStyle: "none", borderBottom: "1px solid #eee", padding: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{p.name}</strong> — ₹{p.price} {p.inStock ? "" : "(out)"}
                    <div style={{ fontSize: 12, color: "#666" }}>{p.description}</div>
                  </div>
                  <div>
                    <button onClick={() => onView(p._id)}>View</button>
                    <button onClick={() => onEdit(p._id)} style={{ marginLeft: 6 }}>Edit</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
