import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useAddTransactionModal } from "@/context/AddTransactionContext";
import AddTransactionModal from "@/components/AddTransactionModal";

interface EditingExpense {
  id: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
  description?: string;
  transaction_type?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { expenses, loading, error, deleteExpense, editExpense, setError } =
    useExpenses();
  const { isOpen, closeModal } = useAddTransactionModal();
  const [activeTab, setActiveTab] = useState<"monthly" | "credits" | "debits">(
    "monthly",
  );
  const [editingExpense, setEditingExpense] = useState<EditingExpense | null>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const handleEdit = (expense: any) => {
    setEditingExpense({
      id: expense.id,
      amount: expense.amount,
      type: expense.type,
      date: expense.date,
      description: expense.description,
      transaction_type: expense.transaction_type,
    });
  };

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

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [expenses, activeTab]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600 mb-1 md:mb-2">
            Expense Tracker
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-violet-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-1 md:mb-2">
              Income
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">
              {formatCurrency(stats.totalCredit)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-violet-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-1 md:mb-2">
              Expense
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">
              {formatCurrency(stats.totalDebit)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-violet-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-1 md:mb-2">
              Balance
            </p>
            <p
              className={`text-lg sm:text-xl md:text-2xl font-bold ${
                stats.balance >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div data-form="add-transaction" className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-violet-500/20 mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-4 md:mb-6">
            {editingExpense ? "Edit Transaction" : "Add Transaction"}
          </h2>

          <div className="space-y-4 md:space-y-4 mb-5 md:mb-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-violet-500/30 rounded-xl focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 placeholder-gray-500 text-base"
                step="0.01"
                min="0"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="What is this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-violet-500/30 rounded-xl focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 placeholder-gray-500 text-base"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="flex gap-2 mb-2">
                {["Cash", "GPay", "Card", "Bank"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTransactionType(transactionType === type ? "" : type)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      transactionType === type
                        ? "bg-violet-600 text-white border border-violet-400"
                        : "bg-violet-900/20 text-gray-300 border border-violet-500/20 hover:border-violet-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {availableTransactionTypes.length > 4 && (
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-violet-500/30 rounded-xl focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 text-base"
                >
                  <option value="">Select or type payment method...</option>
                  {availableTransactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-violet-500/30 rounded-xl focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Defaults to today's date
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAddTransaction("credit")}
              disabled={!amount.trim() || isAddingTransaction}
              className={`flex-1 py-3 md:py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
                !amount.trim() || isAddingTransaction
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 active:bg-green-700"
              }`}
            >
              <Plus className="w-5 h-5" />
              Income
            </button>
            <button
              onClick={() => handleAddTransaction("debit")}
              disabled={!amount.trim() || isAddingTransaction}
              className={`flex-1 py-3 md:py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
                !amount.trim() || isAddingTransaction
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500 active:bg-red-700"
              }`}
            >
              <Plus className="w-5 h-5" />
              Expense
            </button>
            {editingExpense && (
              <button
                onClick={handleCancel}
                className="px-4 py-3 md:py-4 rounded-xl font-semibold transition text-gray-300 border border-gray-500/30 hover:border-gray-400 bg-gray-900/20"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Month Selector for Monthly Tab */}
        {activeTab === "monthly" && (
          <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-violet-500/20 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Select Month
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border-2 border-violet-500/30 rounded-lg focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 text-sm font-medium"
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
                    className="px-3 py-2 border-2 border-violet-500/30 rounded-lg focus:border-violet-400 focus:outline-none transition bg-violet-900/20 text-gray-100 text-sm font-medium"
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
              <div className="w-full sm:w-auto grid grid-cols-2 gap-3">
                <div className="bg-green-900/30 rounded-xl p-3 border border-green-500/30">
                  <p className="text-xs text-gray-400 mb-1">Income</p>
                  <p className="text-sm sm:text-base font-bold text-green-400">
                    {formatCurrency(monthlyStats.totalCredit)}
                  </p>
                </div>
                <div className="bg-red-900/30 rounded-xl p-3 border border-red-500/30">
                  <p className="text-xs text-gray-400 mb-1">Expense</p>
                  <p className="text-sm sm:text-base font-bold text-red-400">
                    {formatCurrency(monthlyStats.totalDebit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-3xl shadow-lg border border-violet-500/20 overflow-hidden">
          <div className="flex border-b border-violet-500/20 overflow-x-auto">
            {[
              { id: "monthly", label: "Monthly" },
              { id: "credits", label: "Income" },
              { id: "debits", label: "Expenses" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-3 sm:px-4 md:px-6 py-3 md:py-4 font-semibold transition text-xs sm:text-sm md:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="p-3 sm:p-4 md:p-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-violet-600/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <div className="w-6 h-6 bg-violet-500 rounded-full"></div>
                </div>
                <p className="text-gray-400">Loading expenses...</p>
              </div>
            ) : displayedExpenses.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-base sm:text-lg">
                  No transactions yet
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Add your first transaction above to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {displayedExpenses.map((expense) => (
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
                          <p className="font-semibold text-gray-100 text-sm sm:text-base truncate">
                            {expense.description ||
                              (expense.type === "credit"
                                ? "Income"
                                : "Expense")}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(expense.date)}
                            {expense.transaction_type && ` • ${expense.transaction_type}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 sm:p-2 hover:bg-violet-600/40 rounded-lg transition text-violet-400 hover:text-violet-300 flex-shrink-0"
                        aria-label="Edit expense"
                      >
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 sm:p-2 hover:bg-red-900/40 rounded-lg transition text-red-400 hover:text-red-300 flex-shrink-0"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
