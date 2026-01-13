import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Expense } from "@shared/api";
import { useAuth } from "./useAuth";

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-key",
);

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses for current user
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      console.log("No user logged in, skipping fetch");
      setExpenses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching expenses for user:", user.id);
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw new Error(fetchError.message);
      }

      console.log("Expenses fetched:", data?.length || 0);
      setExpenses(
        data?.map((exp) => ({
          ...exp,
          date: new Date(exp.date),
        })) || [],
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
        },
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
      description?: string,
      transaction_type?: string,
    ) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        console.log("Adding expense:", {
          user_id: user.id,
          amount,
          type,
          date,
          description,
          transaction_type,
        });

        const { data, error: insertError } = await supabase
          .from("expenses")
          .insert([
            {
              user_id: user.id,
              amount,
              type,
              date,
              description: description || null,
              transaction_type: transaction_type || null,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Supabase insert error details:", {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
          throw new Error(
            insertError.message ||
              "Failed to add expense. Please check if all required fields are valid.",
          );
        }

        console.log("Expense added successfully:", data);

        if (data) {
          setExpenses([{ ...data, date: new Date(data.date) }, ...expenses]);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create expense";
        setError(errorMessage);
        console.error("Add expense error:", err);
        throw err;
      }
    },
    [user, expenses],
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
    [user, expenses],
  );

  // Edit expense
  const editExpense = useCallback(
    async (
      id: string,
      amount: number,
      type: "credit" | "debit",
      date: string,
      description?: string,
      transaction_type?: string,
    ) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("expenses")
          .update({
            amount,
            type,
            date,
            description: description || null,
            transaction_type: transaction_type || null,
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        setExpenses(
          expenses.map((exp) =>
            exp.id === id ? { ...data, date: new Date(data.date) } : exp,
          ),
        );

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update expense";
        setError(errorMessage);
        throw err;
      }
    },
    [user, expenses],
  );

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    editExpense,
    fetchExpenses,
    setError,
  };
}
