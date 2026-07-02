import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setSearchQuery, toggleCompareProduct, clearCompareList } from '../store/search.slice';
import {
  useSearchQuery,
  useAutocompleteQuery,
  useSearchMetadataQuery,
} from '../hooks/useSearchQueries';
import { Search, SlidersHorizontal, Layers, ShoppingCart, Info, Loader2 } from 'lucide-react';
import { addToCart } from '../store';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxQuery = useSelector((state: RootState) => state.search.query);
  const compareIds = useSelector((state: RootState) => state.search.compareIds);

  const [inputVal, setInputVal] = useState(reduxQuery);
  const [searchTerm, setSearchTerm] = useState(reduxQuery);
  const category = '';

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc'>('price_asc');

  // React Query Hooks
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useSearchQuery(searchTerm, category, !!searchTerm);
  const { data: suggestions = [] } = useAutocompleteQuery(inputVal, !!inputVal);
  const { data: searchMeta } = useSearchMetadataQuery();

  // Synced state on mounts/searches
  useEffect(() => {
    setInputVal(reduxQuery);
    setSearchTerm(reduxQuery);
  }, [reduxQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      dispatch(setSearchQuery(inputVal.trim()));
      setSearchTerm(inputVal.trim());
    }
  };

  const handleSuggestionClick = (val: string) => {
    setInputVal(val);
    dispatch(setSearchQuery(val));
    setSearchTerm(val);
  };

  const toggleMarketplaceFilter = (name: string) => {
    setSelectedMarketplaces((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  };

  // Filter & sort logic on derived results
  const rawProducts = searchResults?.products || [];
  const filteredProducts = rawProducts
    .filter((prod: any) => {
      if (prod.price > maxPrice) return false;
      if (selectedMarketplaces.length > 0 && !selectedMarketplaces.includes(prod.marketplace))
        return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      return 0;
    });

  const getMarketplaceBadgeColor = (name: string): string => {
    switch (name) {
      case 'Amazon':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Flipkart':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Meesho':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300';
      case 'Croma':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'Reliance Digital':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'Blinkit':
      case 'Zepto':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2">
      {/* Search Input Bar layout */}
      <div className="relative p-6 rounded-3xl glass-panel border border-border shadow-md">
        <form onSubmit={handleSearchSubmit} className="relative flex gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search products across Amazon, Flipkart, Blinkit, Croma..."
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary outline-none transition-all text-base"
              aria-label="Search products across marketplaces"
            />
            <Search className="absolute left-4 top-4.5 text-muted-foreground w-5 h-5" />
          </div>
          <button
            type="submit"
            className="px-6 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition"
            aria-label="Execute search query"
          >
            Search
          </button>
        </form>

        {/* Autocomplete box */}
        {inputVal && suggestions.length > 0 && (
          <div className="absolute left-6 right-6 mt-2 bg-card border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border">
            {suggestions.map((item: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="w-full text-left px-5 py-3 hover:bg-muted text-sm font-semibold flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Recent & Trending links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-muted-foreground items-center">
          <span className="uppercase text-[10px] tracking-widest text-indigo-500 font-extrabold">
            Trending:
          </span>
          {(searchMeta?.trending || ['iPhone 15', 'Running Shoes', 'Milk']).map(
            (term: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(term)}
                className="hover:text-primary"
              >
                {term}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Main Results area */}
      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Filters Panel desktop */}
        <aside
          className={`md:col-span-1 p-6 bg-card border rounded-3xl space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}
        >
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Filters
            </h3>
            <button
              onClick={() => setMaxPrice(120000)}
              className="text-xs text-primary hover:underline font-bold"
            >
              Reset
            </button>
          </div>

          {/* Price filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Max Price: ₹{maxPrice}
            </label>
            <input
              type="range"
              min={100}
              max={150000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Marketplace toggle filters */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Marketplace
            </label>
            {['Amazon', 'Flipkart', 'Meesho', 'Croma', 'Reliance Digital', 'Blinkit', 'Zepto'].map(
              (market) => (
                <label
                  key={market}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={selectedMarketplaces.includes(market)}
                    onChange={() => toggleMarketplaceFilter(market)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                  {market}
                </label>
              ),
            )}
          </div>

          {/* Sort By selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border rounded-xl text-sm outline-none font-semibold"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>
        </aside>

        {/* Results layout */}
        <section className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground px-2">
            <p>
              {filteredProducts.length} items found for "{searchTerm || 'Catalog'}"
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* Loading spinner */}
          {(isLoading || isFetching) && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Aggregating marketplace listings...</p>
            </div>
          )}

          {/* Empty Grid */}
          {!isLoading && !isFetching && filteredProducts.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
              <Info className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-bold text-muted-foreground">
                No matching products found. Adjust filters.
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && !isFetching && filteredProducts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((prod: any) => {
                const isCompared = compareIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="group bg-card border rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border/80"
                  >
                    {/* Header Image */}
                    <div className="relative aspect-video w-full bg-muted overflow-hidden">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getMarketplaceBadgeColor(prod.marketplace)}`}
                      >
                        {prod.marketplace}
                      </span>
                    </div>

                    {/* Content Detail */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {prod.title}
                          </h4>
                        </div>
                        <p className="text-[10px] font-extrabold text-muted-foreground uppercase mt-1 tracking-wider">
                          {prod.brand}
                        </p>
                      </div>

                      {/* Pricing Tag */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-foreground">
                          ₹{prod.price}
                        </span>
                        {prod.originalPrice > prod.price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{prod.originalPrice}
                            </span>
                            <span className="text-xs text-green-600 font-bold dark:text-green-400">
                              {prod.discountPercentage}% off
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground space-y-1">
                        <p>
                          🕒 Delivery:{' '}
                          <span className="text-foreground">
                            {prod.deliveryTimeDays <= 0.05
                              ? 'Instant (15 mins)'
                              : `${prod.deliveryTimeDays} days`}
                          </span>
                        </p>
                        <p>
                          🛡️ Warranty:{' '}
                          <span className="text-foreground">{prod.warrantyMonths} months</span>
                        </p>
                      </div>

                      {/* CTA Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <button
                          onClick={() => {
                            dispatch(
                              addToCart({
                                id: prod.id,
                                title: prod.title,
                                price: prod.price,
                                image: prod.imageUrl,
                                marketplace: prod.marketplace,
                              }),
                            );
                            alert(`${prod.title} added to local checkout cart.`);
                          }}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add
                        </button>
                        <button
                          onClick={() => dispatch(toggleCompareProduct(prod.id))}
                          className={`flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-muted transition ${isCompared ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' : ''}`}
                        >
                          {isCompared ? 'Comparing' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Bottom Comparison Drawer */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 bg-card border rounded-3xl shadow-2xl p-5 max-w-sm w-full z-50 animate-slide-up border-primary/20">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-extrabold text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Compare List ({compareIds.length}/4)
            </h4>
            <button
              onClick={() => dispatch(clearCompareList())}
              className="text-xs text-muted-foreground hover:text-red-500 font-bold"
            >
              Clear All
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-4 font-semibold">
            Compare prices, bank offers, and AI Best Value indices side-by-side.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/compare')}
              disabled={compareIds.length < 2}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              Compare Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchPage;
