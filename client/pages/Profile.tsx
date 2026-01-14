import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mail, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { expenses } = useExpenses();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate overall statistics
  const stats = {
    totalTransactions: expenses.length,
    totalIncome: expenses
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0),
    totalExpenses: expenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0),
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="pb-32">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            Profile
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Manage your account
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 md:p-8 border border-slate-700 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-1 truncate">
                {user?.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">User Account</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3 sm:space-y-4 border-t border-slate-700 pt-4 sm:pt-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-xs sm:text-sm text-gray-100 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
                <p className="text-xs sm:text-sm text-gray-100">
                  {user?.created_at ? formatDate(user.created_at) : "Recently"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1 sm:mb-2">
              Total Transactions
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400">
              {stats.totalTransactions}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1 sm:mb-2">Total Income</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 truncate">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <p className="text-xs text-gray-400 mb-1 sm:mb-2">Total Expenses</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 truncate">
              {formatCurrency(stats.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 md:p-8 border border-slate-700 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4">
            Settings
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-200">
                  Dark Theme
                </p>
                <p className="text-xs text-gray-500">Currently enabled</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative flex-shrink-0 ml-2">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-200">
                  Notifications
                </p>
                <p className="text-xs text-gray-500">Get alerts</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative flex-shrink-0 ml-2">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 sm:px-6 bg-red-600 hover:bg-red-500 text-white rounded font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* Privacy Info */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-800 rounded border border-slate-700">
          <p className="text-xs sm:text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Privacy:</span> Your
            data is encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
