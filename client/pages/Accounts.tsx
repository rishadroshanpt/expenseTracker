import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoanEntry {
  id: string;
  accountType: string; // "cash" | "account" | "loan-given" | "credit-card" | "loan-taken"
  name: string; // person's name
  initialAmount: number;
  amountReceived: number;
  amountPaid: number;
  date: string;
  description: string;
}

interface FormDataState {
  [key: string]: {
    name: string;
    initialAmount: string;
    amountReceived: string;
    amountPaid: string;
    description: string;
  };
}

export default function Accounts() {
  const { expenses } = useExpenses();
  const { toast } = useToast();
  const [expandedSection, setExpandedSection] = useState<string | null>("assets");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loanEntries, setLoanEntries] = useState<LoanEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [formDataByType, setFormDataByType] = useState<FormDataState>({});

  // Get form data for a specific type - returns default if not yet initialized
  const getFormData = (type: string) => {
    return (
      formDataByType[type] || {
        name: "",
        initialAmount: "",
        amountReceived: "",
        amountPaid: "",
        description: "",
      }
    );
  };

  const updateFormData = (type: string, field: string, value: string) => {
    setFormDataByType((prev) => {
      const currentFormData = prev[type] || {
        name: "",
        initialAmount: "",
        amountReceived: "",
        amountPaid: "",
        description: "",
      };
      return {
        ...prev,
        [type]: {
          ...currentFormData,
          [field]: value,
        },
      };
    });
  };

  // Calculate account totals from expenses
  const accountTotals = useMemo(() => {
    const totals: { [key: string]: number } = {
      cash: 0,
      account: 0,
      "credit-card": 0,
    };

    expenses.forEach((exp) => {
      if (exp.transaction_type === "Cash") {
        totals.cash += exp.type === "credit" ? exp.amount : -exp.amount;
      } else if (exp.transaction_type === "Account") {
        totals.account += exp.type === "credit" ? exp.amount : -exp.amount;
      } else if (exp.transaction_type === "Credit Card") {
        totals["credit-card"] += exp.type === "debit" ? exp.amount : -exp.amount;
      }
    });

    return totals;
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const calculateBalance = (entry: LoanEntry, accountType: string) => {
    // For Loans Given: initialAmount - received (what I still have to receive)
    // For Loans Taken: initialAmount - paid (what I still have to pay)
    if (accountType === "loan-given") {
      return entry.initialAmount - entry.amountReceived;
    } else {
      // loan-taken
      return entry.initialAmount - entry.amountPaid;
    }
  };

  const handleAddEntry = (accountType: string) => {
    const formData = getFormData(accountType);
    if (!formData.name || !formData.initialAmount) {
      toast({
        title: "Error",
        description: "Please fill in name and amount",
        variant: "destructive",
      });
      return;
    }

    const newEntry: LoanEntry = {
      id: Date.now().toString(),
      accountType,
      name: formData.name,
      initialAmount: parseFloat(formData.initialAmount),
      amountReceived: parseFloat(formData.amountReceived || "0"),
      amountPaid: parseFloat(formData.amountPaid || "0"),
      date: new Date().toISOString().split("T")[0],
      description: formData.description,
    };

    setLoanEntries([...loanEntries, newEntry]);
    setFormDataByType((prev) => ({
      ...prev,
      [accountType]: {
        name: "",
        initialAmount: "",
        amountReceived: "",
        amountPaid: "",
        description: "",
      },
    }));
    setShowAddForm(null);

    toast({
      title: "Success",
      description: "Entry added successfully",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setLoanEntries(loanEntries.filter((e) => e.id !== id));
    toast({
      title: "Success",
      description: "Entry deleted",
    });
  };

  const handleUpdateAmount = (id: string, type: "received" | "paid", amount: number) => {
    setLoanEntries(
      loanEntries.map((e) => {
        if (e.id === id) {
          if (type === "received") {
            return { ...e, amountReceived: e.amountReceived + amount };
          } else {
            return { ...e, amountPaid: e.amountPaid + amount };
          }
        }
        return e;
      })
    );
  };

  const AssetSection = () => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() =>
          setExpandedSection(expandedSection === "assets" ? null : "assets")
        }
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700 transition"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white">Assets</h2>
        {expandedSection === "assets" ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expandedSection === "assets" && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Cash Category - No Add Entry */}
          <div className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
            <div className="w-full flex items-center justify-between p-3 sm:p-4">
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Cash
                </h3>
                <p className="text-sm text-gray-400">
                  {formatCurrency(accountTotals.cash)}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Account Category - No Add Entry */}
          <div className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
            <div className="w-full flex items-center justify-between p-3 sm:p-4">
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Bank Account
                </h3>
                <p className="text-sm text-gray-400">
                  {formatCurrency(accountTotals.account)}
                </p>
              </div>
            </div>
          </div>

          {/* Loan Given Category */}
          <CategoryCard
            title="Loans Given"
            type="loan-given"
            loanEntries={loanEntries.filter((e) => e.accountType === "loan-given")}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            formData={getFormData("loan-given")}
            onFormDataChange={(field, value) =>
              updateFormData("loan-given", field, value)
            }
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateAmount={handleUpdateAmount}
            formatCurrency={formatCurrency}
            calculateBalance={calculateBalance}
            isLoanType={true}
          />
        </div>
      )}
    </div>
  );

  const LiabilitySection = () => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() =>
          setExpandedSection(expandedSection === "liabilities" ? null : "liabilities")
        }
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700 transition"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white">Liabilities</h2>
        {expandedSection === "liabilities" ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expandedSection === "liabilities" && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Credit Card Category */}
          <CategoryCard
            title="Credit Cards"
            type="credit-card"
            total={accountTotals["credit-card"]}
            loanEntries={loanEntries.filter((e) => e.accountType === "credit-card")}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            formData={getFormData("credit-card")}
            onFormDataChange={(field, value) =>
              updateFormData("credit-card", field, value)
            }
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateAmount={handleUpdateAmount}
            formatCurrency={formatCurrency}
            calculateBalance={calculateBalance}
          />

          {/* Loan Taken Category */}
          <CategoryCard
            title="Loans Taken"
            type="loan-taken"
            loanEntries={loanEntries.filter((e) => e.accountType === "loan-taken")}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            formData={getFormData("loan-taken")}
            onFormDataChange={(field, value) =>
              updateFormData("loan-taken", field, value)
            }
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateAmount={handleUpdateAmount}
            formatCurrency={formatCurrency}
            calculateBalance={calculateBalance}
            isLoanType={true}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-32">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Accounts
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Manage assets and liabilities
          </p>
        </div>

        {/* Assets Section */}
        <AssetSection />

        {/* Liabilities Section */}
        <LiabilitySection />
      </div>
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  type: string;
  total?: number;
  loanEntries: LoanEntry[];
  expandedCategory: string | null;
  setExpandedCategory: (category: string | null) => void;
  showAddForm: string | null;
  setShowAddForm: (type: string | null) => void;
  formData: {
    name: string;
    initialAmount: string;
    amountReceived: string;
    amountPaid: string;
    description: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onAddEntry: (type: string) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateAmount: (id: string, type: "received" | "paid", amount: number) => void;
  formatCurrency: (amount: number) => string;
  calculateBalance: (entry: LoanEntry, accountType: string) => number;
  isLoanType?: boolean;
}

function CategoryCard({
  title,
  type,
  total,
  loanEntries,
  expandedCategory,
  setExpandedCategory,
  showAddForm,
  setShowAddForm,
  formData,
  onFormDataChange,
  onAddEntry,
  onDeleteEntry,
  onUpdateAmount,
  formatCurrency,
  calculateBalance,
  isLoanType = false,
}: CategoryCardProps) {
  const isExpanded = expandedCategory === type;
  const totalAmount = isLoanType
    ? loanEntries.reduce((sum, e) => sum + calculateBalance(e, type), 0)
    : total || 0;

  return (
    <div className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
      <button
        onClick={() => setExpandedCategory(isExpanded ? null : type)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-600 transition"
      >
        <div className="text-left">
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-600 p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Loan Entries List */}
          {loanEntries.length > 0 ? (
            <div className="space-y-3">
              {loanEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-800 rounded p-3 border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {entry.name}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-gray-400">{entry.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Initial:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(entry.initialAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {type === "loan-given" ? "Received:" : "Received:"}
                      </span>
                      <span className="text-green-400 font-semibold">
                        {formatCurrency(entry.amountReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {type === "loan-given" ? "Paid:" : "Paid:"}
                      </span>
                      <span className="text-blue-400 font-semibold">
                        {formatCurrency(entry.amountPaid)}
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 flex justify-between">
                      <span className="text-gray-300 font-semibold">Balance:</span>
                      <span
                        className={`font-semibold ${
                          calculateBalance(entry, type) > 0
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {formatCurrency(calculateBalance(entry, type))}
                      </span>
                    </div>
                  </div>

                  {/* Quick action buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => {
                        const amount = prompt(
                          type === "loan-given"
                            ? "Amount received from borrower:"
                            : "Amount received from lender:"
                        );
                        if (amount) {
                          onUpdateAmount(entry.id, "received", parseFloat(amount));
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 rounded transition"
                    >
                      + Received
                    </button>
                    <button
                      onClick={() => {
                        const amount = prompt(
                          type === "loan-given"
                            ? "Amount paid to borrower:"
                            : "Amount paid to lender:"
                        );
                        if (amount) {
                          onUpdateAmount(entry.id, "paid", parseFloat(amount));
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded transition"
                    >
                      + Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No entries yet</p>
          )}

          {/* Add Entry Form */}
          {showAddForm === type ? (
            <div className="bg-slate-800 rounded p-3 border border-emerald-600 space-y-2">
              <input
                type="text"
                placeholder="Person's name"
                value={formData.name}
                onChange={(e) => onFormDataChange("name", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Initial amount"
                value={formData.initialAmount}
                onChange={(e) => onFormDataChange("initialAmount", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Amount received (optional)"
                value={formData.amountReceived}
                onChange={(e) =>
                  onFormDataChange("amountReceived", e.target.value)
                }
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Amount paid (optional)"
                value={formData.amountPaid}
                onChange={(e) => onFormDataChange("amountPaid", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange("description", e.target.value)
                }
                className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onAddEntry(type)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded transition font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(null)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-xs py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(type)}
              className="w-full flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm py-2 border border-dashed border-emerald-600 rounded transition"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
