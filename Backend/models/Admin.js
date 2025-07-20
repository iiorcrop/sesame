const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function() { return this.role !== 'staff'; },
      // Only unique for admins, not staff
    },
    userID: {
      type: String,
      required: function() { return this.role === 'staff'; },
      // Not unique, allow duplicates for staff
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "staff"],
      default: "admin",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Unique index for email, only for non-staff and only if email is a string
AdminSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { role: { $ne: "staff" }, email: { $type: "string" } }
  }
);

// Guarantee staff users never have email set
AdminSchema.pre('save', function(next) {
  if (this.role === 'staff' && this.email !== undefined) {
    this.email = undefined;
  }
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
