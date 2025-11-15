import React, { useEffect, useState } from "react";
import { api } from "../api";

type Props = { id?: string; onSaved?: () => void };

export default function ProductForm({ id, onSaved }: Props) {
  const [form, setForm] = useState({ name: "", description: "", price: 0, inStock: true, tags: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm({ name: "", description: "", price: 0, inStock: true, tags: "" });
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const p = await api.getProduct(id);
        setForm({ name: p.name, description: p.description || "", price: p.price, inStock: p.inStock, tags: (p.tags || []).join(",") });
      } catch (e) { alert(String(e)); }
      setLoading(false);
    })();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: form.name, description: form.description, price: Number(form.price), inStock: !!form.inStock, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      if (id) {
        await api.updateProduct(id, payload);
        alert("Updated");
      } else {
        await api.createProduct(payload);
        alert("Created");
      }
      onSaved?.();
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <form onSubmit={submit} style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
      <h3>{id ? "Edit Product" : "New Product"}</h3>
      <div><input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
      <div><textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div><input type="number" placeholder="Price" value={String(form.price)} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={0} required /></div>
      <div>
        <label><input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} /> In stock</label>
      </div>
      <div><input placeholder="tags comma separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{id ? "Save" : "Create"}</button>
      </div>
    </form>
  );
}
