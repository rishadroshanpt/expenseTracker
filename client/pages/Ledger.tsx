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

    // Sort oldest to newest for balance calculation
    const sortedForBalance = filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate running balance for each transaction
    const withBalance = sortedForBalance.map((expense) => {
      return { ...expense, runningBalance: 0 };
    });

    let runningBalance = 0;
    withBalance.forEach((item) => {
      runningBalance +=
        item.type === "credit" ? item.amount : -item.amount;
      item.runningBalance = runningBalance;
    });

    // Return sorted newest first for display, but with correct running balance
    return withBalance.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
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
          <h1 className="text-4xl font-bold text-white mb-2">Ledger</h1>
          <p className="text-base text-gray-400">
            Complete transaction history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Income Only</option>
                <option value="debit">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Select a method...</option>
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
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Income</p>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(summary.credits)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Expenses</p>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(summary.debits)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p
              className={`text-xl font-bold ${
                summary.balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                <p className="text-gray-400 mt-3">Loading transactions...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-600 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            expense.type === "credit"
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {expense.type === "credit" ? "+" : "−"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm">
                            {expense.description ||
                              (expense.type === "credit"
                                ? "Income"
                                : "Expense")}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{formatDate(expense.date)}</span>
                            {expense.transaction_type && (
                              <>
                                <span>•</span>
                                <span>{expense.transaction_type}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p
                        className={`text-base font-bold whitespace-nowrap ${
                          expense.type === "credit"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {expense.type === "credit" ? "+" : "−"}
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Balance: {formatCurrency(expense.runningBalance)}
                      </p>
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
