import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function ProductView({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getProduct(id);
        if (mounted) setProduct(data);
      } catch (e) { alert(String(e)); }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!product) return <div>Loading product...</div>;
  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
      <h3>{product.name}</h3>
      <div>Price: ₹{product.price}</div>
      <div>{product.inStock ? "In stock" : "Out of stock"}</div>
      <div style={{ marginTop: 8 }}>{product.description}</div>
      <div style={{ marginTop: 8 }}>{(product.tags || []).join(", ")}</div>
    </div>
  );
}
