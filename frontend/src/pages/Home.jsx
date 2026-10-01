import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-[#fdfbf7]">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">

          {/* Left */}
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-medium tracking-[0.35em] text-[#b08d57]">
              TIMELESS ELEGANCE
            </p>

            <h1 className="font-serif text-5xl leading-tight text-stone-900 sm:text-6xl lg:text-7xl">
              Jewellery that
              <span className="block italic text-[#b08d57]">
                tells your story.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
              Discover thoughtfully crafted jewellery designed
              to celebrate your most beautiful moments.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-stone-900 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-[#b08d57]"
              >
                Explore Collection
              </Link>

              <Link
                to="/products"
                className="rounded-full border border-stone-300 px-8 py-3.5 text-sm font-medium tracking-wide text-stone-800 transition-all duration-300 hover:border-[#b08d57] hover:text-[#b08d57]"
              >
                Shop Jewellery
              </Link>
            </div>
          </div>

          {/* Right decorative jewellery area */}
          <div className="relative flex min-h-[480px] items-center justify-center">

            <div className="absolute h-80 w-80 rounded-full bg-[#eee1c8] blur-3xl" />

            <div className="relative flex h-[420px] w-[360px] items-center justify-center overflow-hidden rounded-t-[180px] rounded-b-3xl border border-[#d8c19a] bg-gradient-to-br from-[#f5ead5] to-[#d8c19a] shadow-2xl">

              <div className="text-center">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[3px] border-[#b08d57]">
                  <div className="h-24 w-24 rotate-45 rounded-2xl border-[3px] border-[#b08d57]" />
                </div>

                <p className="mt-8 text-xs tracking-[0.4em] text-stone-700">
                  SIGNATURE
                </p>

                <h2 className="mt-2 font-serif text-3xl text-stone-900">
                  Collection
                </h2>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="mb-12 text-center">
            <p className="text-xs font-medium tracking-[0.35em] text-[#b08d57]">
              DISCOVER
            </p>

            <h2 className="mt-3 font-serif text-4xl text-stone-900">
              Explore Our Collections
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-stone-500">
              From everyday elegance to statement pieces,
              find jewellery made for every occasion.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <Link
              to="/products"
              className="group relative overflow-hidden rounded-3xl bg-[#f4eee3] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-xs tracking-[0.3em] text-[#b08d57]">
                COLLECTION 01
              </p>

              <h3 className="mt-3 font-serif text-3xl text-stone-900">
                Necklaces
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                Elegant pieces designed to complete
                every look.
              </p>

              <span className="mt-8 inline-block text-sm font-medium text-stone-800 group-hover:text-[#b08d57]">
                Explore →
              </span>
            </Link>

            <Link
              to="/products"
              className="group relative overflow-hidden rounded-3xl bg-stone-900 p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-xs tracking-[0.3em] text-[#d8b979]">
                COLLECTION 02
              </p>

              <h3 className="mt-3 font-serif text-3xl">
                Rings
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-300">
                Meaningful designs for unforgettable
                moments.
              </p>

              <span className="mt-8 inline-block text-sm font-medium text-[#d8b979]">
                Explore →
              </span>
            </Link>

            <Link
              to="/products"
              className="group relative overflow-hidden rounded-3xl bg-[#eee1c8] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-span-2 lg:col-span-1"
            >
              <p className="text-xs tracking-[0.3em] text-[#8d6b37]">
                COLLECTION 03
              </p>

              <h3 className="mt-3 font-serif text-3xl text-stone-900">
                Bracelets
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                Subtle luxury crafted for your everyday
                moments.
              </p>

              <span className="mt-8 inline-block text-sm font-medium text-stone-800 group-hover:text-[#8d6b37]">
                Explore →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-xs font-medium tracking-[0.35em] text-[#b08d57]">
              WHY CHOOSE US
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
              Crafted with care.
              <span className="block italic text-[#b08d57]">
                Made to last.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-stone-600">
              Every piece in our collection is selected
              with attention to design, quality and the
              moments it becomes part of.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex rounded-full border border-stone-900 px-7 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              View Collection
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-3xl bg-[#f4eee3] p-7">
              <div className="text-3xl text-[#b08d57]">
                ✦
              </div>

              <h3 className="mt-5 font-serif text-xl">
                Timeless Design
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Elegant designs that remain beautiful
                beyond trends.
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-stone-900 p-7 text-white">
              <div className="text-3xl text-[#d8b979]">
                ♢
              </div>

              <h3 className="mt-5 font-serif text-xl">
                Premium Feel
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-300">
                Jewellery selected for quality and
                everyday elegance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 px-6 py-20 text-center text-white">
        <p className="text-xs tracking-[0.4em] text-[#d8b979]">
          FIND YOUR SIGNATURE PIECE
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl sm:text-5xl">
          Something beautiful is waiting for you.
        </h2>

        <Link
          to="/products"
          className="mt-8 inline-block rounded-full bg-[#b08d57] px-8 py-3.5 text-sm font-medium transition hover:bg-[#d8b979]"
        >
          Shop Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-[#fdfbf7]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-stone-500 sm:flex-row lg:px-8">

          <p>
            © 2026 Jewellery Collection
          </p>

          <p className="font-serif tracking-[0.2em] text-stone-800">
            ELEGANCE • CRAFT • BEAUTY
          </p>

        </div>
      </footer>

    </div>
  );
}

export default Home;