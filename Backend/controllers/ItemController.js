// controllers/ItemController.js
const MainItem = require("../models/MainItem");
const SubItem = require("../models/SubItem");
const SubSubItem = require("../models/SubSubItem");

// Create Main Item
exports.createMainItem = async (req, res) => {
  try {
    const mainItemsData = req.body; // Expecting an array of objects
    const mainItems = await MainItem.insertMany(mainItemsData);
    res.status(201).json({ mainItems });
  } catch (error) {
    res.status(500).json({ message: "Error creating main items", error });
  }
};

// Create Sub Item
exports.createSubItem = async (req, res) => {
  try {
    const subItemsData = req.body; // Expecting an array of objects
    console.log("Sub Items Data:", subItemsData);
    const subItems = await SubItem.insertMany(subItemsData);
    res.status(201).json({ subItems });
  } catch (error) {
    res.status(500).json({ message: "Error creating sub items", error });
  }
};

// Create Sub-Sub Item
exports.createSubSubItem = async (req, res) => {
  try {
    const subSubItemsData = req.body; // Expecting an array of objects
    const subSubItems = await SubSubItem.insertMany(subSubItemsData);
    res.status(201).json({ subSubItems });
  } catch (error) {
    res.status(500).json({ message: "Error creating sub-sub items", error });
  }
};

// Update Main Item
exports.updateMainItem = async (req, res) => {
  try {
    const updatedMainItem = await MainItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMainItem) {
      return res.status(404).json({ message: "Main item not found" });
    }
    res.status(200).json(updatedMainItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating main item", error });
  }
};

// Update Sub Item
exports.updateSubItem = async (req, res) => {
  try {
    // Destructure to get the new main item name and other update data
    const { mainItemName, ...updatedData } = req.body;

    // If a new mainItemName is provided, find the MainItem by its name
    if (mainItemName) {
      const mainItem = await MainItem.findOne({ name: mainItemName });

      // If no MainItem with that name is found, return an error
      if (!mainItem) {
        return res
          .status(404)
          .json({ message: "Main item with this name not found" });
      }

      // Set the parent_id to the found MainItem's ID
      updatedData.parent_id = mainItem._id;
    }

    // Now, update the SubItem with the provided data
    const updatedSubItem = await SubItem.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedSubItem) {
      return res.status(404).json({ message: "Sub item not found" });
    }

    res.status(200).json(updatedSubItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating sub item", error });
  }
};

// Update Sub-Sub Item
exports.updateSubSubItem = async (req, res) => {
  try {
    // Destructure to get the new subItemName and other update data
    const { subItemName, ...updatedData } = req.body;

    // If a new subItemName is provided, find the SubItem by its name
    if (subItemName) {
      const subItem = await SubItem.findOne({ name: subItemName });

      // If no SubItem with that name is found, return an error
      if (!subItem) {
        return res
          .status(404)
          .json({ message: "Sub item with this name not found" });
      }

      // Set the parent_id to the found SubItem's ID
      updatedData.sub_parent_id = subItem._id;
    }

    // Now, update the SubSubItem with the provided data
    const updatedSubSubItem = await SubSubItem.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedSubSubItem) {
      return res.status(404).json({ message: "Sub-sub item not found" });
    }

    res.status(200).json(updatedSubSubItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating sub-sub item", error });
  }
};

// Delete Main Item
exports.deleteMainItem = async (req, res) => {
  try {
    const deletedMainItem = await MainItem.findByIdAndDelete(req.params.id);
    if (!deletedMainItem) {
      return res.status(404).json({ message: "Main item not found" });
    }
    res.status(200).json({ message: "Main item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting main item", error });
  }
};

// Delete Sub Item
exports.deleteSubItem = async (req, res) => {
  try {
    const deletedSubItem = await SubItem.findByIdAndDelete(req.params.id);
    if (!deletedSubItem) {
      return res.status(404).json({ message: "Sub item not found" });
    }
    res.status(200).json({ message: "Sub item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sub item", error });
  }
};

// Delete Sub-Sub Item
exports.deleteSubSubItem = async (req, res) => {
  try {
    const deletedSubSubItem = await SubSubItem.findByIdAndDelete(req.params.id);
    if (!deletedSubSubItem) {
      return res.status(404).json({ message: "Sub-sub item not found" });
    }
    res.status(200).json({ message: "Sub-sub item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sub-sub item", error });
  }
};

// controllers/ItemController.js

// Get All Main Items
exports.getAllMainItems = async (req, res) => {
  try {
    const mainItems = await MainItem.find();
    res.status(200).json({ mainItems });
  } catch (error) {
    res.status(500).json({ message: "Error fetching main items", error });
  }
};

// Get All Sub Items
exports.getAllSubItems = async (req, res) => {
  try {
    const subItems = await SubItem.find().populate("parent_id");
    res.status(200).json({ subItems });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub items", error });
  }
};

// Get All Sub-Sub Items
exports.getAllSubSubItems = async (req, res) => {
  try {
    const subSubItems = await SubSubItem.find().populate({
      path: "sub_parent_id", // Populate subitem
      populate: {
        path: "parent_id", // Populate main item
        select: "name", // Only fetch the 'name' field of the main item
      },
    });
    res.status(200).json({ subSubItems });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-sub items", error });
  }
};

// update drag and drop functionality
// controllers/mainItemController.js

// In your controller
// controllers/itemController.js
exports.updatemainItemOrder = async (req, res) => {
  try {
    const updatedItems = req.body; // [{ name, position }]

    if (!Array.isArray(updatedItems) || updatedItems.length === 0) {
      return res.status(400).json({ message: "Invalid or empty payload" });
    }

    // Fetch all main items to match by name
    const mainItems = await MainItem.find();

    // Create a map of name → { name, position }
    const itemMap = new Map(updatedItems.map((item) => [item.name, item]));

    // Prepare bulk update operations
    const bulkOps = mainItems
      .filter((item) => itemMap.has(item.name)) // ensure match by old name
      .map((item) => {
        const updatedItem = itemMap.get(item.name);
        return {
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                name: updatedItem.name,
                position: updatedItem.position,
              },
            },
          },
        };
      });

    if (bulkOps.length === 0) {
      return res
        .status(400)
        .json({ message: "No matching items found to update" });
    }

    await MainItem.bulkWrite(bulkOps);

    res
      .status(200)
      .json({ message: "Main item names and positions updated successfully" });
  } catch (error) {
    console.error("Error updating main items:", error);
    res.status(500).json({ message: "Failed to update main items", error });
  }
};
