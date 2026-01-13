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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600 mb-2">
            Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage your account
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-3xl p-6 sm:p-8 shadow-lg border border-violet-500/20 mb-6">
          <div className="flex items-center gap-4 sm:gap-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1">
                {user?.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm sm:text-base text-gray-400">
                Premium Member
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4 border-t border-violet-500/20 pt-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                <p className="text-sm sm:text-base text-gray-100 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
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
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Transactions
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {stats.totalTransactions}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-2xl p-4 sm:p-6 shadow-lg border border-green-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Income
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-500/20">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Total Expenses
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-red-400">
              {formatCurrency(stats.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 rounded-3xl p-6 sm:p-8 shadow-lg border border-violet-500/20 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-4">
            Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-xl border border-violet-500/20 hover:border-violet-400 transition">
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-200">
                  Dark Theme
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Currently enabled
                </p>
              </div>
              <div className="w-12 h-6 bg-violet-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-violet-900/20 rounded-xl border border-violet-500/20 hover:border-violet-400 transition">
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-200">
                  Notifications
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Get alerts for transactions
                </p>
              </div>
              <div className="w-12 h-6 bg-violet-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 text-base shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* Privacy Info */}
        <div className="mt-8 p-4 bg-violet-900/20 rounded-xl border border-violet-500/20">
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
