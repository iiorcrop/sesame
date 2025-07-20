const Committee = require("../models/CommittesModel");
const { sanitizeInput } = require("../utils/sanitizeInput");

// Get all committees
exports.getCommittees = async (req, res) => {
  try {
    const committees = await Committee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: committees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching committees",
      error: error.message,
    });
  }
};

// Get committee by ID
exports.getCommitteeById = async (req, res) => {
  try {
    const { id } = req.params;

    const committee = await Committee.findById(id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: committee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching committee",
      error: error.message,
    });
  }
};

// Create a new committee
exports.createCommittee = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // Sanitize input data
    const sanitizedData = {
      name: sanitizeInput(name),
      description: sanitizeInput(description),
      members: members
        ? members.map((member) => ({
            name: sanitizeInput(member.name),
            role: sanitizeInput(member.role),
            designation: member.designation
              ? sanitizeInput(member.designation)
              : undefined,
          }))
        : [],
    };

    // Validate members array
    if (sanitizedData.members.length > 0) {
      for (const member of sanitizedData.members) {
        if (!member.name || !member.role) {
          return res.status(400).json({
            success: false,
            message: "Each member must have a name and role",
          });
        }
      }
    }

    const committee = await Committee.create(sanitizedData);

    res.status(201).json({
      success: true,
      data: committee,
      message: "Committee created successfully",
    });
  } catch (error) {
    console.log("Error creating committee:", error);

    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A committee with this name already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Error creating committee",
      error: error.message,
    });
  }
};

// Update a committee
exports.updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    // Prepare update data
    const updateData = {};

    if (name) {
      updateData.name = sanitizeInput(name);
    }

    if (description) {
      updateData.description = sanitizeInput(description);
    }

    if (members !== undefined) {
      updateData.members = members.map((member) => ({
        name: sanitizeInput(member.name),
        role: sanitizeInput(member.role),
        designation: member.designation
          ? sanitizeInput(member.designation)
          : undefined,
      }));

      // Validate members array
      for (const member of updateData.members) {
        if (!member.name || !member.role) {
          return res.status(400).json({
            success: false,
            message: "Each member must have a name and role",
          });
        }
      }
    }

    const committee = await Committee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: committee,
      message: "Committee updated successfully",
    });
  } catch (error) {
    console.log("Error updating committee:", error);

    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A committee with this name already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Error updating committee",
      error: error.message,
    });
  }
};

// Delete a committee
exports.deleteCommittee = async (req, res) => {
  try {
    const { id } = req.params;

    const committee = await Committee.findByIdAndDelete(id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Committee deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting committee",
      error: error.message,
    });
  }
};

// Add a member to a committee
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, designation } = req.body;

    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required for a member",
      });
    }

    // Sanitize member data
    const newMember = {
      name: sanitizeInput(name),
      role: sanitizeInput(role),
      designation: designation ?? undefined,
    };

    const committee = await Committee.findByIdAndUpdate(
      id,
      { $push: { members: newMember } },
      { new: true, runValidators: true }
    );

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: committee,
      message: "Member added successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding member",
      error: error.message,
    });
  }
};

// Remove a member from a committee
exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const committee = await Committee.findByIdAndUpdate(
      id,
      { $pull: { members: { _id: memberId } } },
      { new: true }
    );

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: committee,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error removing member",
      error: error.message,
    });
  }
};

// Update a specific member in a committee
exports.updateMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { name, role, designation } = req.body;

    // Prepare update data for the member
    const updateFields = {};
    if (name) updateFields["members.$.name"] = sanitizeInput(name);
    if (role) updateFields["members.$.role"] = sanitizeInput(role);
    if (designation !== undefined) {
      updateFields["members.$.designation"] = designation ?? ndefined;
    }

    const committee = await Committee.findOneAndUpdate(
      { _id: id, "members._id": memberId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee or member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: committee,
      message: "Member updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating member",
      error: error.message,
    });
  }
};
