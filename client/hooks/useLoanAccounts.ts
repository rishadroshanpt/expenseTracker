import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "./useAuth";

export interface LoanAccount {
  id: string;
  user_id: string;
  account_type: "loan-given" | "loan-taken" | "credit-card";
  name: string;
  initial_amount: number;
  amount_received: number;
  amount_paid: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-key",
);

export function useLoanAccounts() {
  const { user } = useAuth();
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch loan accounts for current user
  const fetchLoanAccounts = useCallback(async () => {
    if (!user) {
      console.log("No user logged in, skipping loan accounts fetch");
      setLoanAccounts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching loan accounts for user:", user.id);
      const { data, error: fetchError } = await supabase
        .from("loan_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw new Error(fetchError.message);
      }

      console.log("Loan accounts fetched:", data?.length || 0);
      setLoanAccounts(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch loan accounts";
      setError(errorMessage);
      console.error("Fetch loan accounts error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchLoanAccounts();

    if (!user) return;

    const channel = supabase
      .channel(`loan_accounts:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loan_accounts",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchLoanAccounts();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchLoanAccounts]);

  // Add new loan account
  const addLoanAccount = useCallback(
    async (
      accountType: "loan-given" | "loan-taken" | "credit-card",
      name: string,
      initialAmount: number,
      amountReceived: number = 0,
      amountPaid: number = 0,
      description: string = "",
    ) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from("loan_accounts")
          .insert([
            {
              user_id: user.id,
              account_type: accountType,
              name,
              initial_amount: initialAmount,
              amount_received: amountReceived,
              amount_paid: amountPaid,
              description: description || null,
              date: new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          throw new Error(insertError.message || "Failed to add loan account");
        }

        console.log("Loan account added successfully:", data);
        setLoanAccounts([data, ...loanAccounts]);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create loan account";
        setError(errorMessage);
        console.error("Add loan account error:", err);
        throw err;
      }
    },
    [user, loanAccounts],
  );

  // Update loan account amounts
  const updateLoanAccount = useCallback(
    async (id: string, amountReceived: number, amountPaid: number) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("loan_accounts")
          .update({
            amount_received: amountReceived,
            amount_paid: amountPaid,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        setLoanAccounts(
          loanAccounts.map((account) => (account.id === id ? data : account)),
        );
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update loan account";
        setError(errorMessage);
        throw err;
      }
    },
    [user, loanAccounts],
  );

  // Delete loan account
  const deleteLoanAccount = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("loan_accounts")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        setLoanAccounts(loanAccounts.filter((account) => account.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete loan account";
        setError(errorMessage);
        throw err;
      }
    },
    [user, loanAccounts],
  );

  return {
    loanAccounts,
    loading,
    error,
    addLoanAccount,
    updateLoanAccount,
    deleteLoanAccount,
    fetchLoanAccounts,
    setError,
  };
}
