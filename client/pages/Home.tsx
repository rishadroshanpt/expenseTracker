import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";

export default function Home() {
  const { user } = useAuth();
  const { expenses, loading, error, deleteExpense, editExpense, setError } =
    useExpenses();
  const { isOpen, closeModal } = useAddTransactionModal();
  const [activeTab, setActiveTab] = useState<"monthly" | "credits" | "debits">(
    "monthly",
  );

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Get expenses for a specific month
  const getMonthExpenses = (month: number, year: number) => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === month && expDate.getFullYear() === year;
    });
  };

  // Calculate statistics for current month only
  const stats = useMemo(() => {
    const currentMonthExpenses = getMonthExpenses(
      now.getMonth(),
      now.getFullYear(),
    );
    const totalCredit = currentMonthExpenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalDebit = currentMonthExpenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const allTimeCredit = expenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const allTimeDebit = expenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = allTimeCredit - allTimeDebit;

    return { totalCredit, totalDebit, balance };
  }, [expenses, now]);

  const getCurrentMonthExpenses = () => {
    return getMonthExpenses(selectedMonth, selectedYear);
  };

  const monthlyStats = useMemo(() => {
    const monthExpenses = getMonthExpenses(selectedMonth, selectedYear);
    const totalCredit = monthExpenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalDebit = monthExpenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalCredit, totalDebit };
  }, [expenses, selectedMonth, selectedYear]);

  const displayedExpenses = useMemo(() => {
    let filtered = expenses;

    if (activeTab === "monthly") {
      filtered = getCurrentMonthExpenses();
    } else if (activeTab === "credits") {
      filtered = expenses.filter((e) => e.type === "credit");
    } else if (activeTab === "debits") {
      filtered = expenses.filter((e) => e.type === "debit");
    }

    // Sort by date and time in descending order (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(b.date).getTime();
      const dateB = new Date(a.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      // If same date, sort by time descending (newer times first)
      const timeA = b.time || "00:00";
      const timeB = a.time || "00:00";
      return timeA.localeCompare(timeB);
    });
  }, [expenses, activeTab]);

  const formatDate = (date: Date | string, time?: string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const dateStr = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (time) {
      return `${dateStr} • ${time}`;
    }
    return dateStr;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="pb-32">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Expense Tracker
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 truncate">
            Welcome, {user?.email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-slate-800 rounded-lg p-2 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-0.5">Income</p>
            <p className="text-sm sm:text-xl md:text-2xl font-bold text-green-400 truncate">
              {formatCurrency(stats.totalCredit)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-2 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-0.5">Expense</p>
            <p className="text-sm sm:text-xl md:text-2xl font-bold text-red-400 truncate">
              {formatCurrency(stats.totalDebit)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-2 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-0.5">Balance</p>
            <p
              className={`text-sm sm:text-xl md:text-2xl font-bold truncate ${
                stats.balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal isOpen={isOpen} onClose={closeModal} />

        {/* Month Selector for Monthly Tab */}
        {activeTab === "monthly" && (
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Select Month
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, idx) => (
                      <option key={idx} value={idx}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monthly Totals */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-slate-700 rounded-lg p-2 sm:p-3 border border-slate-600">
                  <p className="text-xs text-gray-400 mb-1">Income</p>
                  <p className="text-sm sm:text-base font-bold text-green-400 truncate">
                    {formatCurrency(monthlyStats.totalCredit)}
                  </p>
                </div>
                <div className="bg-slate-700 rounded-lg p-2 sm:p-3 border border-slate-600">
                  <p className="text-xs text-gray-400 mb-1">Expense</p>
                  <p className="text-sm sm:text-base font-bold text-red-400 truncate">
                    {formatCurrency(monthlyStats.totalDebit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700 overflow-x-auto">
            {[
              { id: "monthly", label: "Monthly" },
              { id: "credits", label: "Income" },
              { id: "debits", label: "Expenses" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 font-medium transition text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                <p className="text-gray-400 mt-3">Loading expenses...</p>
              </div>
            ) : displayedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Add your first transaction using the + button below
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {displayedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-600 transition gap-2 sm:gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                            expense.type === "credit"
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {expense.type === "credit" ? "+" : "−"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-xs sm:text-sm truncate">
                            {expense.description ||
                              (expense.type === "credit"
                                ? "Income"
                                : "Expense")}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(expense.date, expense.time)}
                            {expense.transaction_type &&
                              ` • ${expense.transaction_type}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <p
                        className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                          expense.type === "credit"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {expense.type === "credit" ? "+" : "−"}
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 sm:p-2 hover:bg-red-600/30 rounded text-red-400 hover:text-red-300 flex-shrink-0"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
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
