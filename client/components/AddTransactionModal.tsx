import { useState, useMemo } from "react";
import { Plus, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExpenses } from "@/hooks/useExpenses";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const { addExpense, editExpense } = useExpenses();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [transactionType, setTransactionType] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleAddTransaction = async (type: "credit" | "debit") => {
    if (!amount.trim()) return;

    setIsAdding(true);

    try {
      await addExpense(
        parseFloat(amount),
        type,
        selectedDate,
        description || undefined,
        transactionType || undefined,
      );
      // Reset form
      setAmount("");
      setDescription("");
      setSelectedDate(today);
      setTransactionType("");
      onClose();
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && amount.trim()) {
      handleAddTransaction("debit");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 border border-violet-500/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <div className="flex gap-2 flex-wrap">
              {["Cash", "GPay", "Card", "Bank"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setTransactionType(transactionType === type ? "" : type)
                  }
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
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleAddTransaction("credit")}
            disabled={!amount.trim() || isAdding}
            className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 active:bg-green-700"
            }`}
          >
            <Plus className="w-5 h-5" />
            Income
          </button>
          <button
            onClick={() => handleAddTransaction("debit")}
            disabled={!amount.trim() || isAdding}
            className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500 active:bg-red-700"
            }`}
          >
            <Plus className="w-5 h-5" />
            Expense
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
