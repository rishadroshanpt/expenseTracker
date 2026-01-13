import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Trash2, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";

export default function ExpenseTracker() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { expenses, loading, error, addExpense, deleteExpense, setError } =
    useExpenses();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeTab, setActiveTab] = useState<"monthly" | "credits" | "debits">(
    "monthly",
  );
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleAddTransaction = async (type: "credit" | "debit") => {
    if (!amount.trim()) return;

    setError(null);
    setIsAddingTransaction(true);

    try {
      await addExpense(
        parseFloat(amount),
        type,
        selectedDate,
        description || undefined
      );
      setAmount("");
      setDescription("");
      setSelectedDate(today);
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);

    try {
      await deleteExpense(id);
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && amount.trim()) {
      handleAddTransaction("debit");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCredit = expenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalDebit = expenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = totalCredit - totalDebit;

    return { totalCredit, totalDebit, balance };
  }, [expenses]);

  // Get current month's expenses
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    });
  };

  // Filter data based on active tab
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header with Logout */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-1 md:mb-2">
              Expense Tracker
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome, {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-2">
              Income
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCredit)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-2">
              Expense
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDebit)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-2">
              Balance
            </p>
            <p
              className={`text-lg sm:text-xl md:text-2xl font-bold ${
                stats.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Add Transaction
          </h2>

          <div className="space-y-4 md:space-y-4 mb-5 md:mb-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition bg-gray-50 text-base"
                step="0.01"
                min="0"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="What is this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition bg-gray-50 text-base"
              />
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition bg-gray-50 text-base"
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
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 active:bg-green-700"
              }`}
            >
              <Plus className="w-5 h-5" />
              Income
            </button>
            <button
              onClick={() => handleAddTransaction("debit")}
              disabled={!amount.strip() || isAddingTransaction}
              className={`flex-1 py-3 md:py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
                !amount.trim() || isAddingTransaction
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 active:bg-red-700"
              }`}
            >
              <Plus className="w-5 h-5" />
              Expense
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
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
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
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
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
                </div>
                <p className="text-gray-500">Loading expenses...</p>
              </div>
            ) : displayedExpenses.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-base sm:text-lg">
                  No transactions yet
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Add your first transaction above to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {displayedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 text-sm sm:text-base ${
                            expense.type === "credit"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {expense.type === "credit" ? "+" : "−"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {expense.description ||
                              (expense.type === "credit"
                                ? "Income"
                                : "Expense")}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(expense.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <p
                        className={`text-base sm:text-lg font-bold whitespace-nowrap ${
                          expense.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {expense.type === "credit" ? "+" : "−"}
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition text-red-600 hover:text-red-700 flex-shrink-0"
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
