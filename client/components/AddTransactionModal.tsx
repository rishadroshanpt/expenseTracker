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
  const kolkataTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
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
      <DialogContent className="bg-slate-800 border border-slate-700 max-w-md w-[90vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5 sm:space-y-4 py-2 sm:py-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-2.5 sm:px-4 py-1.5 sm:py-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-gray-400 text-xs sm:text-base focus:outline-none focus:border-blue-500"
              step="0.01"
              min="0"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="What is this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-2.5 sm:px-4 py-1.5 sm:py-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-gray-400 text-xs sm:text-base focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
              Payment Method
            </label>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {["Cash", "GPay", "Card", "Bank"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setTransactionType(transactionType === type ? "" : type)
                  }
                  className={`px-1.5 sm:px-3 py-1 sm:py-2 rounded text-xs font-semibold transition ${
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

          {/* Date & Time Pickers in Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Date</span>
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-slate-600 rounded bg-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Time</span>
                </div>
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-slate-600 rounded bg-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 sm:mt-6">
          <button
            onClick={() => handleAddTransaction("credit")}
            disabled={!amount.trim() || isAdding}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded font-semibold transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Income</span>
            <span className="sm:hidden">Inc</span>
          </button>
          <button
            onClick={() => handleAddTransaction("debit")}
            disabled={!amount.trim() || isAdding}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded font-semibold transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-white ${
              !amount.trim() || isAdding
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Expense</span>
            <span className="sm:hidden">Exp</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
