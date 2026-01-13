import { useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Plus, Trash2 } from "lucide-react";

export default function TransactionTypes() {
  const { expenses } = useExpenses();

  // Get all payment methods and their usage count
  const paymentMethods = useMemo(() => {
    const methods: { [key: string]: { count: number; total: number; lastUsed: string } } = {};

    expenses.forEach((exp) => {
      const method = exp.transaction_type || "Not Specified";
      if (!methods[method]) {
        methods[method] = { count: 0, total: 0, lastUsed: exp.date };
      }
      methods[method].count += 1;
      methods[method].total += exp.amount;
      // Update last used if this transaction is more recent
      if (new Date(exp.date) > new Date(methods[method].lastUsed)) {
        methods[method].lastUsed = exp.date;
      }
    });

    return Object.entries(methods)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [expenses]);

  const defaultMethods = ["Cash", "GPay", "Card", "Bank"];

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="pb-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600 mb-2">
            Payment Methods
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage your transaction types
          </p>
        </div>

        {/* Default Methods */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-4">
            Quick Add Options
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {defaultMethods.map((method) => (
              <button
                key={method}
                className="p-3 sm:p-4 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-xl font-semibold transition text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{method}</span>
                <span className="sm:hidden">{method.substring(0, 1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods List */}
        {paymentMethods.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">
              Your Payment Methods
            </h2>
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-2xl p-4 sm:p-6 shadow-lg border border-violet-500/20 hover:border-violet-400 transition"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {method.name[0]}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-100">
                          {method.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Last used {formatDate(method.lastUsed)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-red-900/40 rounded-lg transition text-red-400 hover:text-red-300 flex-shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-violet-500/20">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Times Used
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-violet-400">
                      {method.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Total Amount
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-violet-400">
                      {formatCurrency(method.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-2xl p-8 sm:p-12 shadow-lg border border-violet-500/20 text-center">
            <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-base sm:text-lg mb-2">
              No payment methods yet
            </p>
            <p className="text-gray-500 text-sm sm:text-base">
              Add your first transaction to create a payment method
            </p>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 p-4 sm:p-6 bg-violet-900/20 rounded-2xl border border-violet-500/20">
          <h3 className="text-sm sm:text-base font-bold text-gray-100 mb-2">
            💡 Tips
          </h3>
          <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
            <li>
              • Payment methods are created automatically when you add a transaction
            </li>
            <li>
              • Track spending patterns by payment method in the Ledger view
            </li>
            <li>
              • Common methods include: Cash, GPay, Card (Credit/Debit), Bank Transfer
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
