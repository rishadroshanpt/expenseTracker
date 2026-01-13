import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { CreateExpenseRequest, ExpensesResponse, Expense } from "@shared/api";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client only if credentials are provided
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Get expenses for authenticated user
export const handleGetExpenses: RequestHandler = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Optional query parameters for filtering
    const { startDate, endDate, type } = req.query;

    let query = supabase
      .from("expenses")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });

    // Apply filters if provided
    if (startDate) {
      query = query.gte("date", startDate as string);
    }

    if (endDate) {
      query = query.lte("date", endDate as string);
    }

    if (type && (type === "credit" || type === "debit")) {
      query = query.eq("type", type);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error("Get expenses error:", error);
      return res.status(500).json({ error: "Failed to fetch expenses" });
    }

    const response: ExpensesResponse = {
      expenses: expenses || [],
    };

    res.json(response);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new expense
export const handleCreateExpense: RequestHandler = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { amount, type, date, description } =
      req.body as CreateExpenseRequest;

    // Validate input
    if (!amount || !type || !date) {
      return res
        .status(400)
        .json({ error: "Amount, type, and date are required" });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be greater than zero" });
    }

    if (type !== "credit" && type !== "debit") {
      return res.status(400).json({ error: "Type must be credit or debit" });
    }

    // Create expense
    const { data: newExpense, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: req.user.id,
          amount,
          type,
          date,
          description: description || null,
        },
      ])
      .select("*")
      .single();

    if (error || !newExpense) {
      console.error("Create expense error:", error);
      return res.status(500).json({ error: "Failed to create expense" });
    }

    res.status(201).json(newExpense as Expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete expense
export const handleDeleteExpense: RequestHandler = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Expense ID is required" });
    }

    // Verify user owns this expense
    const { data: expense, error: selectError } = await supabase
      .from("expenses")
      .select("user_id")
      .eq("id", id)
      .single();

    if (selectError || !expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete expense
    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete expense error:", deleteError);
      return res.status(500).json({ error: "Failed to delete expense" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
