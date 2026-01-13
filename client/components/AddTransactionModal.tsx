import { useState, useMemo } from "react";
import { Plus, Calendar, Clock } from "lucide-react";
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

// Helper function to get current Kolkata time
function getKolkataDateTime() {
  const now = new Date();
  const kolkataTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return {
    date: kolkataTime.toISOString().split("T")[0],
    time: kolkataTime.toTimeString().slice(0, 5),
  };
}

export default function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const { addExpense, editExpense } = useExpenses();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const kolkataDateTime = getKolkataDateTime();
  const [selectedDate, setSelectedDate] = useState(kolkataDateTime.date);
  const [selectedTime, setSelectedTime] = useState(kolkataDateTime.time);
  const [transactionType, setTransactionType] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const today = kolkataDateTime.date;

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
        selectedTime || undefined,
      );
      // Reset form
      setAmount("");
      setDescription("");
      const freshDateTime = getKolkataDateTime();
      setSelectedDate(freshDateTime.date);
      setSelectedTime(freshDateTime.time);
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
      <DialogContent className="bg-slate-800 border border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-gray-400 text-base focus:outline-none focus:border-blue-500"
              step="0.01"
              min="0"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="What is this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-gray-400 text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="flex gap-2 flex-wrap">
              {["Cash", "GPay", "Card", "Bank"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setTransactionType(transactionType === type ? "" : type)
                  }
                  className={`px-3 py-2 rounded text-xs font-semibold transition ${
                    transactionType === type
                      ? "bg-blue-600 text-white border border-blue-500"
                      : "bg-slate-700 text-gray-300 border border-slate-600 hover:border-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </div>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-600 rounded bg-slate-700 text-white text-base focus:outline-none focus:border-blue-500"
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
            className={`flex-1 py-2 rounded font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            <Plus className="w-4 h-4" />
            Income
          </button>
          <button
            onClick={() => handleAddTransaction("debit")}
            disabled={!amount.trim() || isAdding}
            className={`flex-1 py-2 rounded font-semibold transition flex items-center justify-center gap-2 text-base text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            <Plus className="w-4 h-4" />
            Expense
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
