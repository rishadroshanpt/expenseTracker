import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";

export default function Ledger() {
  const { expenses, loading } = useExpenses();
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">(
    "all",
  );
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.transaction_type) {
        methods.add(exp.transaction_type);
      }
    });
    return Array.from(methods).sort();
  }, [expenses]);

  // Filter and sort expenses with running balance
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    if (filterPaymentMethod !== "all") {
      filtered = filtered.filter(
        (e) => e.transaction_type === filterPaymentMethod,
      );
    }

    const sorted = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Calculate running balance for each transaction
    let runningBalance = 0;
    return sorted.map((expense) => {
      runningBalance += expense.type === "credit" ? expense.amount : -expense.amount;
      return { ...expense, runningBalance };
    });
  }, [expenses, filterType, filterPaymentMethod]);

  // Calculate summary
  const summary = useMemo(() => {
    const credits = filteredExpenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const debits = filteredExpenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { credits, debits, balance: credits - debits };
  }, [filteredExpenses]);


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-400 mb-2">
            Ledger
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Complete transaction history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-700 mb-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition bg-gray-700 text-gray-100 text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Income Only</option>
                <option value="debit">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition bg-gray-700 text-gray-100 text-sm"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          <div className="bg-green-900/40 rounded-2xl p-3 sm:p-4 shadow-lg border border-green-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Income</p>
            <p className="text-lg sm:text-xl font-bold text-green-400">
              {formatCurrency(summary.credits)}
            </p>
          </div>
          <div className="bg-red-900/40 rounded-2xl p-3 sm:p-4 shadow-lg border border-red-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Expenses</p>
            <p className="text-lg sm:text-xl font-bold text-red-400">
              {formatCurrency(summary.debits)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Balance</p>
            <p
              className={`text-lg sm:text-xl font-bold ${
                summary.balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-2xl shadow-lg border border-violet-500/20 overflow-hidden">
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-violet-600/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <div className="w-6 h-6 bg-violet-500 rounded-full"></div>
                </div>
                <p className="text-gray-400">Loading transactions...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-violet-900/20 rounded-xl hover:bg-violet-900/30 transition border border-violet-500/20 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 text-sm sm:text-base ${
                            expense.type === "credit"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {expense.type === "credit" ? "+" : "−"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-100 text-sm sm:text-base">
                            {expense.description ||
                              (expense.type === "credit"
                                ? "Income"
                                : "Expense")}
                          </p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <span>{formatDate(expense.date)}</span>
                            {expense.transaction_type && (
                              <>
                                <span>•</span>
                                <span className="text-violet-400">
                                  {expense.transaction_type}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-base sm:text-lg font-bold whitespace-nowrap ${
                            expense.type === "credit"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {expense.type === "credit" ? "+" : "−"}
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          Balance: {formatCurrency(expense.runningBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
