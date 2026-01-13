import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Expense } from "@shared/api";
import { useAuth } from "./useAuth";

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || "",
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ""
);

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses for current user
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setExpenses(
        data?.map((exp) => ({
          ...exp,
          date: new Date(exp.date),
        })) || []
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch expenses";
      setError(errorMessage);
      console.error("Fetch expenses error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchExpenses();

    if (!user) return;

    const channel = supabase
      .channel(`expenses:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch when changes occur
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchExpenses]);

  // Add new expense
  const addExpense = useCallback(
    async (
      amount: number,
      type: "credit" | "debit",
      date: string,
      description?: string
    ) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from("expenses")
          .insert([
            {
              user_id: user.id,
              amount,
              type,
              date,
              description: description || null,
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (data) {
          setExpenses([
            { ...data, date: new Date(data.date) },
            ...expenses,
          ]);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create expense";
        setError(errorMessage);
        throw err;
      }
    },
    [user, expenses]
  );

  // Delete expense
  const deleteExpense = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        setExpenses(expenses.filter((exp) => exp.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete expense";
        setError(errorMessage);
        throw err;
      }
    },
    [user, expenses]
  );

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    fetchExpenses,
    setError,
  };
}
