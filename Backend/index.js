const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const connectPestsDB = require("./config/pestsDb");
// Import database connections for automatic initialization
const varietiesConnection = require("./config/varietiesDb");
const diseasesConnection = require("./config/diseasesDb");
const pestsConnection = require("./config/pestsDb");
const hybridsConnection = require("./config/hybridsDb");
const { closeAllYearConnections } = require("./utils/yearDatabaseHelper");
// const { getAPYYearDbConnection } = require("./utils/apyDatabaseHelper");
const authRoutes = require("./routes/authRoutes");
const MarketDataRoutes = require("./routes/MarketDataRoutes");
const PestRoutes = require("./routes/PestRoutes");
const AboutInfoRoutes = require("./routes/AboutInfoRoutes");
const FlashEventRoutes = require("./routes/flashEventRoutes");
const itemRoutes = require("./routes/itemRoutes");
const WhatsappRoutes = require("./routes/WhatsappRoutes");
const MarketYearRoutes = require("./routes/MarketYearRoutes");
const APYRoutes = require("./routes/APYRoutes");
const SurveyFormRoutes = require("./routes/surveyInput.routes");

const VarietyRoutes = require("./routes/VarietyRoutes");
const DiseaseRoutes = require("./routes/DiseaseRoutes");
const HybridRoutes = require("./routes/HybridRoutes");
const pestModelRoutes = require("./routes/PestModelRoutes");
const SocialMediaRoutes = require("./routes/SocialMediaRoutes");
const formResponseRoutes = require("./routes/SurveyResponse.routes");
const TitleRoutes = require("./routes/title.routes");
const AddressRoutes = require("./routes/Address.routes");
const MSPRoutes = require("./routes/MSPRoutes");
const ResourceRoutes = require("./routes/resource.routes");
const OfferingsRoutes = require("./routes/offerings.routes");
const AnualReportRoutes = require("./routes/AnualReports.routes");
const EventRoutes = require("./routes/event.routes");
const MediaRoutes = require("./routes/media.routes");
const newsRoutes = require("./routes/news.routes");
const CommitteesRoutes = require("./routes/committees.routes");
const RecurringEventRoutes = require("./routes/recurringEvent.routes");

const imageRouter = require("./controllers/StoreImage");
const cardRouter = require("./controllers/CardImage");
const StaffInputRoutes = require("./routes/StaffInputRoutes");
const staffDetailRoutes = require("./routes/StaffDetailRoutes");
const FlashNewsRoutes = require("./routes/FlashNewsRoutes");

dotenv.config();
connectDB();
// Initialize the pests database connection
connectPestsDB()
  .then(() => {
    console.log("Pests database initialized");
  })
  .catch((err) => {
    console.error("Failed to initialize pests database:", err);
  });

const app = express();

// Set up CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api", MarketDataRoutes);

app.use("/api", PestRoutes);

app.use("/api", AboutInfoRoutes);

app.use("/api", itemRoutes);

app.use("/api", SocialMediaRoutes);

app.use("/api", MarketYearRoutes);

app.use("/api", APYRoutes);

app.use("/api", VarietyRoutes);

app.use("/api", DiseaseRoutes);

app.use("/api", HybridRoutes);

app.use("/api", pestModelRoutes);
app.use("/api", TitleRoutes);

app.use("/api/whatsapp-number", WhatsappRoutes);

app.use("/api/flash-events", FlashEventRoutes);
app.use("/api/inputs", SurveyFormRoutes);
app.use("/api/form-responses", formResponseRoutes);
app.use("/api/web", TitleRoutes);
app.use("/api/address", AddressRoutes);
app.use("/api", MSPRoutes); // MSP routes
app.use("/api/resource", ResourceRoutes);
app.use("/api/offerings", OfferingsRoutes);
app.use("/api/anual-reports", AnualReportRoutes);
app.use("/api/events", EventRoutes);
app.use("/api/media", MediaRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/committees", CommitteesRoutes);
app.use("/api/recurring-events", RecurringEventRoutes);

app.use("/api/staff-inputs", StaffInputRoutes);
app.use("/api/staff-details", staffDetailRoutes);
app.use("/api/flash-news", FlashNewsRoutes);

app.use(imageRouter("CastorSlider", "/castorSlider"));

app.use(cardRouter("CastorCard", "/castorCard"));

// Graceful shutdown function
async function gracefulShutdown() {
  console.log("Closing HTTP server and database connections.");
  try {
    // Close all specialized database connections
    await varietiesConnection.close();
    await diseasesConnection.close();
    await pestsConnection.close();
    await hybridsConnection.close();
    // Close main MongoDB connection
    await mongoose.connection.close();
    // Close year-specific connections
    await closeAllYearConnections();
    console.log("Database connections closed gracefully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function gracefulShutdown() {
  console.log("Shutting down gracefully...");

  try {
    // Close the Express server
    server.close(() => {
      console.log("HTTP server closed");
    }); // Close all year database connections
    await closeAllYearConnections();

    // Close the varieties database connection
    await varietiesConnection.close();
    console.log("Varieties database connection closed");

    // Close the diseases database connection
    await diseasesConnection.close();
    console.log("Diseases database connection closed");

    // Close the pests database connection
    await pestsConnection.close();
    console.log("Pests database connection closed");

    // Close the hybrids database connection
    await hybridsConnection.close();
    console.log("Hybrids database connection closed");

    // Close the main MongoDB connection
    await mongoose.connection.close();
    console.log("Main MongoDB connection closed");

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
}
