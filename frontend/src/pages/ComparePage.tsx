import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearCompareList, toggleCompareProduct } from '../store/search.slice';
import { useCompareQuery } from '../hooks/useSearchQueries';
import { ArrowLeft, Trash2, ShieldCheck, Zap, Award, Sparkles, Loader2, Info } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const compareIds = useSelector((state: RootState) => state.search.compareIds);

  const { data: matrix, isLoading, isError } = useCompareQuery(compareIds, compareIds.length >= 2);

  if (compareIds.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-md mx-auto text-center px-4">
        <Info className="w-12 h-12 text-indigo-500" />
        <h2 className="text-2xl font-extrabold">Compare Matrix is Empty</h2>
        <p className="text-sm text-muted-foreground font-semibold">
          Select at least 2 products from the search aggregation grid to compute cross-platform
          comparisons.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
        >
          Explore Search Engine
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-semibold">
          Computing best value scores and comparing parameters...
        </p>
      </div>
    );
  }

  if (isError || !matrix) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-semibold">Failed to resolve comparison data matrix.</p>
        <button
          onClick={() => dispatch(clearCompareList())}
          className="px-6 py-2 border rounded-full font-bold"
        >
          Clear Compare List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight">Compare Matrix</h2>
          <p className="text-muted-foreground font-semibold">
            Compare details, delivery, and AI Value ratings across platforms.
          </p>
        </div>
        <button
          onClick={() => {
            dispatch(clearCompareList());
            navigate('/search');
          }}
          className="flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* Highlights alerts panel (cheapest/fastest/value picks) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Cheapest Card */}
        <div className="p-5 border rounded-3xl bg-card flex gap-4 items-center shadow-sm">
          <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-green-600 block">
              Cheapest Platform
            </span>
            <p className="text-sm font-extrabold mt-0.5">{matrix.cheapest.marketplace}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold">
              ₹{matrix.cheapest.price} best offer
            </p>
          </div>
        </div>

        {/* Fastest Card */}
        <div className="p-5 border rounded-3xl bg-card flex gap-4 items-center shadow-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 block">
              Fastest Delivery
            </span>
            <p className="text-sm font-extrabold mt-0.5">{matrix.fastest.marketplace}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold">
              {matrix.fastest.deliveryTimeDays <= 0.05
                ? 'Instant (15 mins)'
                : `${matrix.fastest.deliveryTimeDays} days`}
            </p>
          </div>
        </div>

        {/* Best Value Pick Card */}
        <div className="p-5 border rounded-3xl bg-card flex gap-4 items-center shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-200/50">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-500 fill-current" />
              AI Best Value Pick
            </span>
            <p className="text-sm font-extrabold mt-0.5">{matrix.bestValue.marketplace}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold">
              Score: {matrix.bestValueScore} / 100
            </p>
          </div>
        </div>
      </div>

      {/* Side by side comparison table grid */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Product Parameter
                </th>
                {matrix.items.map((item: any) => (
                  <th
                    key={item.id}
                    className="px-6 py-4 text-center text-sm font-bold min-w-[200px]"
                  >
                    <div className="space-y-1">
                      <p className="text-foreground line-clamp-1">{item.title}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-secondary">
                        {item.marketplace}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-semibold text-sm text-center">
              {/* Price row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Price
                </td>
                {matrix.items.map((item: any) => {
                  const isCheapest = item.price === matrix.cheapest.price;
                  return (
                    <td
                      key={item.id}
                      className={`px-6 py-4 text-lg font-extrabold ${isCheapest ? 'text-green-600 dark:text-green-400 bg-green-500/5' : ''}`}
                    >
                      ₹{item.price}
                      {isCheapest && (
                        <span className="block text-[10px] font-extrabold text-green-600 dark:text-green-400 mt-0.5">
                          CHEAPEST
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Delivery Speed row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Delivery Time
                </td>
                {matrix.items.map((item: any) => {
                  const isFastest = item.deliveryTimeDays === matrix.fastest.deliveryTimeDays;
                  return (
                    <td
                      key={item.id}
                      className={`px-6 py-4 ${isFastest ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5' : ''}`}
                    >
                      {item.deliveryTimeDays <= 0.05
                        ? 'Instant (15 mins)'
                        : `${item.deliveryTimeDays} days`}
                      {isFastest && (
                        <span className="block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                          FASTEST
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Return Policy row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Return Policy
                </td>
                {matrix.items.map((item: any) => (
                  <td key={item.id} className="px-6 py-4 text-muted-foreground">
                    {item.returnPolicyDays === 0
                      ? 'No Returns'
                      : `${item.returnPolicyDays} Days Return`}
                  </td>
                ))}
              </tr>

              {/* Warranty row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Warranty
                </td>
                {matrix.items.map((item: any) => (
                  <td key={item.id} className="px-6 py-4 text-muted-foreground">
                    {item.warrantyMonths} Months
                  </td>
                ))}
              </tr>

              {/* Cashback row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Co-branded Cashback
                </td>
                {matrix.items.map((item: any) => (
                  <td key={item.id} className="px-6 py-4 text-indigo-600 dark:text-indigo-400">
                    {item.cashbackPercentage}%
                  </td>
                ))}
              </tr>

              {/* Rating row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Rating
                </td>
                {matrix.items.map((item: any) => (
                  <td key={item.id} className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full">
                      ★ {item.rating}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Best Value Score row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  AI Value Score
                </td>
                {matrix.items.map((item: any) => {
                  const isBestValue = item.id === matrix.bestValue.id;
                  return (
                    <td
                      key={item.id}
                      className={`px-6 py-4 ${isBestValue ? 'bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-base font-extrabold ${isBestValue ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}
                        >
                          {item.valueScore} / 100
                        </span>
                        {isBestValue && (
                          <span className="px-2 py-0.5 text-[8px] font-extrabold text-white bg-indigo-600 rounded-full tracking-wider uppercase animate-pulse">
                            Best Value Pick
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Checkout CTA row */}
              <tr>
                <td className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                  Purchase Link
                </td>
                {matrix.items.map((item: any) => (
                  <td key={item.id} className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-center">
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Buy on {item.marketplace}
                      </a>
                      <button
                        onClick={() => dispatch(toggleCompareProduct(item.id))}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ComparePage;
