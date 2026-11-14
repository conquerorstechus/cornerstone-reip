export default function BusinessesPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow !text-magenta">MAIN STREET</p>
        <h2 className="display mt-1 text-2xl font-semibold sm:text-3xl">Businesses for sale</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          Greater Tampa operating businesses — cash flow, lease, and asking price in one book.
        </p>
      </div>
      <div className="bg-cream px-5 py-8 text-sm text-taupe ring-1 ring-line rounded-xl">
        No listings in this book yet.
      </div>
    </div>
  );
}
