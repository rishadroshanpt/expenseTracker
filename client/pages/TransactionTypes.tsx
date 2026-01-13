import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function TransactionTypes() {
  const { expenses } = useExpenses();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set<string>();
    expenses.forEach((exp) => {
      const method = exp.transaction_type || "Not Specified";
      methods.add(method);
    });
    return Array.from(methods).sort();
  }, [expenses]);

  // Get statistics for selected method
  const selectedMethodStats = useMemo(() => {
    if (!selectedMethod) return null;

    const methodExpenses = expenses.filter(
      (e) => e.transaction_type === selectedMethod
    );
    const income = methodExpenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const expense = methodExpenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { income, expense };
  }, [selectedMethod, expenses]);

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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Payment Methods
          </h1>
          <p className="text-base text-gray-400">
            Track by payment method
          </p>
        </div>

        {/* Payment Methods Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Select a Payment Method
          </h2>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() =>
                  setSelectedMethod(selectedMethod === method ? null : method)
                }
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedMethod === method
                    ? "bg-blue-600 text-white border border-blue-500"
                    : "bg-slate-700 text-gray-300 border border-slate-600 hover:border-slate-500"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Method Stats */}
        {selectedMethod && selectedMethodStats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-2">Income</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(selectedMethodStats.income)}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-2">Expense</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(selectedMethodStats.expense)}
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Chart */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
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
                        color: "#f1f5f9",
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
                            backgroundColor:
                              COLORS[index % COLORS.length],
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
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
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
                        color: "#f1f5f9",
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
                            backgroundColor:
                              COLORS[index % COLORS.length],
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
      </div>
    </div>
  );
}
