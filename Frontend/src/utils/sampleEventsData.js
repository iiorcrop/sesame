// Demo data creation script for events
// Run this in the browser console or as a separate script to create sample events

const createSampleEvents = async () => {
  const sampleEvents = [
    {
      title: "Anual Crop Research Conference 2024",
      description:
        "Join us for our Anual conference showcasing the latest research in crop science, sustainable farming practices, and agricultural innovation. This event brings together researchers, farmers, and industry experts from around the world to share knowledge and discuss the future of agriculture.",
      date: new Date("2024-03-15T09:00:00"),
      images: ["/api/placeholder/600/400", "/api/placeholder/600/300"],
    },
    {
      title: "Workshop: Sustainable Farming Techniques",
      description:
        "Learn about modern sustainable farming techniques that can improve crop yield while reducing environmental impact. This hands-on workshop will cover soil health management, water conservation, and organic pest control methods.",
      date: new Date("2024-04-20T10:00:00"),
      images: ["/api/placeholder/600/400"],
    },
    {
      title: "Farmer's Market and Exhibition",
      description:
        "Anual farmer's market featuring local produce, agricultural equipment demonstrations, and educational exhibits about crop varieties and farming innovations.",
      date: new Date("2024-05-10T08:00:00"),
      images: [],
    },
    {
      title: "Research Symposium: Climate-Resilient Crops",
      description:
        "A comprehensive symposium focusing on developing and promoting climate-resilient crop varieties. Experts will present research findings on drought-resistant crops, flood-tolerant varieties, and adaptation strategies for changing climate conditions.",
      date: new Date("2024-06-05T09:30:00"),
      images: ["/api/placeholder/600/400"],
    },
    {
      title: "Digital Agriculture Technology Summit",
      description:
        "Explore the latest in digital agriculture technology including precision farming, IoT sensors, drone applications, and AI-powered crop monitoring systems.",
      date: new Date("2024-07-12T09:00:00"),
      images: [
        "/api/placeholder/600/400",
        "/api/placeholder/600/300",
        "/api/placeholder/600/350",
      ],
    },
    {
      title: "Harvest Festival 2024",
      description:
        "Celebrate the harvest season with our Anual festival featuring local food, agricultural demonstrations, and community activities for all ages.",
      date: new Date("2024-09-22T10:00:00"),
      images: ["/api/placeholder/600/400"],
    },
    {
      title: "Seed Exchange and Plant Fair",
      description:
        "Community event for exchanging seeds, sharing gardening tips, and discovering new plant varieties. Perfect for both novice and experienced gardeners.",
      date: new Date("2024-10-08T09:00:00"),
      images: [],
    },
    {
      title: "Winter Crop Planning Workshop",
      description:
        "Prepare for the winter growing season with expert guidance on crop selection, soil preparation, and season extension techniques.",
      date: new Date("2024-11-15T10:00:00"),
      images: ["/api/placeholder/600/400"],
    },
    // Past events from 2023
    {
      title: "2023 Agricultural Innovation Awards",
      description:
        "Recognition ceremony for outstanding innovations in agriculture, featuring award presentations and networking opportunities.",
      date: new Date("2023-12-10T18:00:00"),
      images: ["/api/placeholder/600/400"],
    },
    {
      title: "Organic Farming Certification Workshop 2023",
      description:
        "Comprehensive workshop on organic farming certification process, requirements, and best practices for transitioning to organic agriculture.",
      date: new Date("2023-08-18T09:00:00"),
      images: ["/api/placeholder/600/400"],
    },
    {
      title: "Youth Agriculture Leadership Program",
      description:
        "Leadership development program for young farmers and agricultural students, featuring mentorship, workshops, and hands-on farm experience.",
      date: new Date("2023-06-25T08:30:00"),
      images: ["/api/placeholder/600/400", "/api/placeholder/600/300"],
    },
    {
      title: "International Crop Science Symposium 2023",
      description:
        "Global symposium bringing together international experts to discuss advances in crop science, biotechnology, and agricultural research methodologies.",
      date: new Date("2023-04-14T09:00:00"),
      images: ["/api/placeholder/600/400"],
    },
  ];

  console.log("Sample events data:", sampleEvents);
  console.log(
    "To create these events, send POST requests to /api/events endpoint with each event object"
  );

  return sampleEvents;
};

// Export for use in testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createSampleEvents };
}

// For browser console usage
if (typeof window !== "undefined") {
  window.createSampleEvents = createSampleEvents;
}
