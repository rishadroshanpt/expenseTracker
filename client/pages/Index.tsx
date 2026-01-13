import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Home, BarChart3, User, CreditCard, Plus } from "lucide-react";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabs = () => {
    return [
      { path: "/", label: "Home", icon: Home },
      { path: "/ledger", label: "Ledger", icon: BarChart3 },
      { path: "/types", label: "Types", icon: CreditCard },
      { path: "/profile", label: "Profile", icon: User },
    ];
  };

  const tabs = getTabs();
  const currentTab = tabs.find((tab) => tab.path === location.pathname);

  const handleAddClick = () => {
    // Navigate to home if not already there, to show the add form
    if (location.pathname !== "/") {
      navigate("/");
    }
    // Scroll to the form (optional enhancement)
    setTimeout(() => {
      const formElement = document.querySelector('[data-form="add-transaction"]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-24">
      {/* Main Content */}
      <Outlet />

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-violet-950 to-violet-900/80 border-t border-violet-500/20 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left Tabs */}
            <div className="flex gap-1 flex-1">
              {tabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition ${
                      isActive
                        ? "text-violet-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold truncate">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Center Add Button */}
            <div className="flex items-center justify-center px-2">
              <button
                onClick={handleAddClick}
                className="w-14 h-14 -mt-8 bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110 border-4 border-violet-950"
                aria-label="Add transaction"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            {/* Right Tabs */}
            <div className="flex gap-1 flex-1 justify-end">
              {tabs.slice(2).map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition ${
                      isActive
                        ? "text-violet-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold truncate">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
