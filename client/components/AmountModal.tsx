import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AmountModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export default function AmountModal({
  isOpen,
  title,
  label,
  onConfirm,
  onCancel,
}: AmountModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    onConfirm(parsedAmount);
    setAmount("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
              step="0.01"
              min="0"
            />
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
