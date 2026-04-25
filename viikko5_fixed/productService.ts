import { type Product } from "./types/Product";

export async function fetchRandomProduct(): Promise<Product> {
  const res = await fetch("https://dummyjson.com/products");

  if (!res.ok) {
    throw new Error("Tuotteen haku epäonnistui.");
  }

  const data = await res.json();
  const products = data.products;
  const randomIndex = Math.floor(Math.random() * products.length);
  const product = products[randomIndex];

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail ?? null,
  };
}
