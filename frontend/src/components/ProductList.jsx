import ProductCard from "./ProductCard";

function ProductList({ products }) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee3] text-2xl text-[#b08d57]">
          ✦
        </div>

        <h3 className="mt-5 font-serif text-2xl text-stone-900">
          No jewellery found
        </h3>

        <p className="mt-2 text-sm text-stone-500">
          Try exploring another collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductList;