const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running"
  });
});

// Receive and store an event
app.post("/api/event", async (req, res) => {
  try {
    const { event, page } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: "event is required"
      });
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          event: String(event),
          page: page ? String(page) : null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return res.status(500).json({
        success: false,
        error: "Database error"
      });
    }

    console.log("Event stored:", data);

    res.status(201).json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});