require("dotenv").config({ quiet: true }); 
const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
  
const app = express(); 
const PORT = process.env.PORT || 5000; 
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cabinet"; 
  
app.use(cors()); 
app.use(express.json()); 
  
app.get("/api/health", (req, res) => res.json({ status: "ok" })); 
app.use("/api/patients", require("./routes/patientRoutes")); 
mongoose.connect(MONGO_URI) 
  .then(() => { 
    console.log("   Connecté à MongoDB"); 
    app.listen(PORT, "0.0.0.0", () => 
      console.log(`        Serveur lancé sur http://localhost:${PORT}`)); 
  }) 
  .catch(err => { 
    console.error("  Erreur MongoDB :", err.message); 
    process.exit(1); 
  });