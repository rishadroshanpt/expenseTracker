import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { hash, compare } from "bcryptjs";
import { generateToken } from "../middleware/auth";
import { AuthResponse, SignUpRequest, LoginRequest, User } from "@shared/api";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client only if credentials are provided
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Sign up handler
export const handleSignUp: RequestHandler = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
      });
    }

    const { email, password } = req.body as SignUpRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: hashedPassword }])
      .select("id, email, created_at")
      .single();

    if (error || !newUser) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // Generate token
    const token = generateToken(newUser.id, newUser.email);

    const response: AuthResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login handler
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
      });
    }

    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash, created_at")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user handler
export const handleGetCurrentUser: RequestHandler = async (req, res) => {
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

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response: AuthResponse = {
      user,
      token: "", // Token is already in client, no need to return
    };

    res.json(response);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete account handler
export const handleDeleteAccount: RequestHandler = async (req, res) => {
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

    const userId = req.user.id;

    // Delete all expenses for this user
    await supabase.from("expenses").delete().eq("user_id", userId);

    // Delete all loan accounts for this user
    await supabase.from("loan_accounts").delete().eq("user_id", userId);

    // Delete the user
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return res.status(500).json({ error: "Failed to delete account" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
