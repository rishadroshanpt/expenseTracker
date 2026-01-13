import { useNavigate } from "react-router-dom";
import { LogOut, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";

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
    return `$${amount.toFixed(2)}`;
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-base text-gray-400">Manage your account</p>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800 rounded-lg p-6 sm:p-8 border border-slate-700 mb-6">
          <div className="flex items-center gap-4 sm:gap-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {user?.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm sm:text-base text-gray-400">User Account</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                <p className="text-sm sm:text-base text-gray-100 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Member Since
                </p>
                <p className="text-sm sm:text-base text-gray-100">
                  {user?.created_at ? formatDate(user.created_at) : "Recently"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Transactions
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {stats.totalTransactions}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Income
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Expenses
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-red-400">
              {formatCurrency(stats.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-slate-800 rounded-lg p-6 sm:p-8 border border-slate-700 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition">
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-200">
                  Dark Theme
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Currently enabled
                </p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition">
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-200">
                  Notifications
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Get alerts for transactions
                </p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2 px-6 bg-red-600 hover:bg-red-500 text-white rounded font-semibold transition flex items-center justify-center gap-2 text-base"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* Privacy Info */}
        <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-700">
          <p className="text-xs sm:text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Privacy Notice:</span>{" "}
            Your data is encrypted and stored securely. We never share your
            information with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
