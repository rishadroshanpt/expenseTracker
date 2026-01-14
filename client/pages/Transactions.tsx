import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Custom tooltip to ensure white text color
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-lg">
        <p className="text-white font-bold text-sm">
          {payload[0].payload.name}: ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Transactions() {
  const { expenses, loading } = useExpenses();
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">(
    "all",
  );
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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
    const sortedForBalance = filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      // If same date, sort by time ascending (older times first)
      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";
      return timeA.localeCompare(timeB);
    });

    // Calculate running balance for each transaction
    const withBalance = sortedForBalance.map((expense) => {
      return { ...expense, runningBalance: 0 };
    });

    let runningBalance = 0;
    withBalance.forEach((item) => {
      runningBalance += item.type === "credit" ? item.amount : -item.amount;
      item.runningBalance = runningBalance;
    });

    // Return sorted newest first for display, but with correct running balance
    return withBalance.sort((a, b) => {
      const dateA = new Date(b.date).getTime();
      const dateB = new Date(a.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      // If same date, sort by time descending (newer times first)
      const timeA = b.time || "00:00";
      const timeB = a.time || "00:00";
      return timeA.localeCompare(timeB);
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

  // Get pie chart data for current month
  const incomeChartData = useMemo(() => {
    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate >= currentMonthStart &&
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear() &&
        exp.type === "credit"
      );
    });

    const methodData: { [key: string]: number } = {};
    currentMonthExpenses.forEach((exp) => {
      const method = exp.transaction_type || "Not Specified";
      methodData[method] = (methodData[method] || 0) + exp.amount;
    });

    return Object.entries(methodData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [expenses, currentMonthStart, now]);

  const expenseChartData = useMemo(() => {
    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate >= currentMonthStart &&
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear() &&
        exp.type === "debit"
      );
    });

    const methodData: { [key: string]: number } = {};
    currentMonthExpenses.forEach((exp) => {
      const method = exp.transaction_type || "Not Specified";
      methodData[method] = (methodData[method] || 0) + exp.amount;
    });

    return Object.entries(methodData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [expenses, currentMonthStart, now]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const formatDate = (date: string, time?: string) => {
    const dateStr = new Date(date).toLocaleDateString("en-US", {
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
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Complete transaction history and analysis
          </p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Income Chart */}
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Income by Payment Method (This Month)
            </h3>
            {incomeChartData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {incomeChartData.map((data, index) => (
                    <div
                      key={data.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-gray-300">{data.name}</span>
                      </div>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(data.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No income data for this month
              </div>
            )}
          </div>

          {/* Expense Chart */}
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Expenses by Payment Method (This Month)
            </h3>
            {expenseChartData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expenseChartData.map((data, index) => (
                    <div
                      key={data.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-gray-300">{data.name}</span>
                      </div>
                      <span className="text-red-400 font-medium">
                        {formatCurrency(data.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No expense data for this month
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Income Only</option>
                <option value="debit">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Income</p>
            <p className="text-base sm:text-xl font-bold text-green-400 truncate">
              {formatCurrency(summary.credits)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Expenses</p>
            <p className="text-base sm:text-xl font-bold text-red-400 truncate">
              {formatCurrency(summary.debits)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p
              className={`text-base sm:text-xl font-bold truncate ${
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
              <div className="space-y-2 sm:space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-stretch justify-between p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-600 transition gap-2 sm:gap-3"
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
                          <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 mt-0.5 overflow-hidden">
                            <span className="truncate">
                              {formatDate(expense.date, expense.time)}
                            </span>
                            {expense.transaction_type && (
                              <>
                                <span className="flex-shrink-0">•</span>
                                <span className="truncate">
                                  {expense.transaction_type}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4 flex-shrink-0 flex flex-col justify-between">
                      <p
                        className={`text-xs sm:text-base font-bold whitespace-nowrap ${
                          expense.type === "credit"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {expense.type === "credit" ? "+" : "−"}
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Bal: {formatCurrency(expense.runningBalance)}
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
