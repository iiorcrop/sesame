const express = require("express");
const mongodb = require("mongodb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { connectToDatabase } = require("../config/Connect_db");

const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

const router = express.Router();

// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir); // Create the folder if it doesn't exist
// }

// Set up multer disk storage for file handling
const storage = multer.diskStorage({
    // destination: (req, file, cb) => {
    //     cb(null, 'uploads/');  // Set the upload directory
    // },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create an instance of multer to handle file uploads
const upload = multer({ storage });

module.exports = function (dbName = "image", commonRoute = "/image", maxImageSize = "5MB", chunk_Value = 15728640) {
    const chunkValue = chunk_Value;  /* 1 MB = 1048576 bytes & 15 MB = 15728640 bytes */
    const imagePrefix = commonRoute;
    const maxSize = maxImageSize;

    let db, bucket;
    const initDb = async () => {
        try {
            db = await connectToDatabase(dbName);
            bucket = new mongodb.GridFSBucket(db);
            console.log("MongoDB connected.");
        } catch (err) {
            console.error("MongoDB connection failed:", err);
            process.exit(1);
        }
    };

    initDb();

    // Utility to convert human-readable size strings into bytes
    const parseFileSize = (sizeString) => {
        const sizeRegex = /^(\d+)(KB|MB|GB|TB|B)$/i;
        const match = sizeString.match(sizeRegex);

        if (!match) {
            throw new Error("Invalid size format. Use KB, MB, GB, or TB.");
        }

        const size = parseInt(match[1], 10);
        const unit = match[2].toUpperCase();

        switch (unit) {
            case 'B': return size;
            case 'KB': return size * 1024;
            case 'MB': return size * 1024 * 1024;
            case 'GB': return size * 1024 * 1024 * 1024;
            case 'TB': return size * 1024 * 1024 * 1024 * 1024;
            default: throw new Error("Unsupported size unit.");
        }
    };

    // Utility to handle file validation
    const validateFile = (file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedImageExtensions.includes(fileExtension)) {
            return { isValid: false, message: "Only image files (jpg, jpeg, png, gif, bmp, webp) are allowed." };
        }

        const maxSizeInBytes = parseFileSize(maxSize);

        if (file.size > maxSizeInBytes) {
            return { isValid: false, message: `Image size exceeds the ${maxSize} limit.` };
        }
        return { isValid: true };
    };

    // ** Image Upload Route (using multer) **
    router.post(`${imagePrefix}`, upload.array('file'), async (req, res) => {
        const { files } = req;  // Files sent from the frontend
        const { labels = [] } = req.body;  // Labels should be an array of labels, one per file

        if (files.length === 0) {
            return res.status(400).json({ error: "No files uploaded", message: "Please upload at least one file." });
        }

        if (files.length !== labels.length) {
            return res.status(400).json({ error: "Mismatched files and labels", message: "Number of labels must match the number of files." });
        }

        // Validate all files
        for (const file of files) {
            const validation = validateFile(file);
            if (!validation.isValid) {
                return res.status(400).json({ error: "Invalid file type", message: validation.message });
            }
        }

        const filePaths = [];

        try {
            // Process each file and its respective label
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const label = labels[i] || '';  // Get the label for this file, default to empty string if not provided
                const filePath = `${Date.now()}-${file.originalname}`;

                const uploadStream = bucket.openUploadStream(filePath, {
                    chunkSizeBytes: chunkValue,
                    metadata: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        label: label,  // Save the label associated with this file
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                    }
                });

                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        const imageMetadata = {
                            fileId: uploadStream.id,
                            url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                            label: label,  // Store label along with file metadata
                        };

                        try {
                            await db.collection('imageAPI').insertOne(imageMetadata);
                        } catch (err) {
                            console.error("Error inserting into imageAPI", err);
                        }
                    })
                    .on("error", (err) => {
                        console.error("Error uploading file", err);
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });

                filePaths.push(filePath);  // Store the file path for response
            }

            // Once all files are processed
            res.json({ message: "Files uploaded successfully", filePaths });
        } catch (err) {
            console.error("Upload failed", err);
            res.status(500).json({ error: "Error uploading files", details: err.message });
        }
    });


    /*  router.post(`${imagePrefix}`, upload.single('file'), async (req, res) => {
        const { file } = req;
        const { label = '' } = req.body;

        const validation = validateFile(file);
        if (!validation.isValid) {
            return res.status(400).json({ error: "Invalid file type", message: validation.message });
        }

        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        const filePath = `${Date.now()}-${file.originalname}`;

        try {
            const uploadStream = bucket.openUploadStream(filePath, {
                chunkSizeBytes: chunkValue,
                metadata: {
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    label: label,
                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                }
            });

            fs.createReadStream(file.path)
                .pipe(uploadStream)
                .on("finish", async () => {
                    const imageMetadata = {
                        fileId: uploadStream.id,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                        label: label
                    };

                    try {
                        await db.collection('imageAPI').insertOne(imageMetadata);
                        res.json({ message: "File uploaded successfully", filePath });
                    } catch (err) {
                        console.error("Error inserting into imageAPI", err);
                        res.status(500).json({ error: "Error storing image metadata", details: err.message });
                    }
                })
                .on("error", (err) => {
                    console.error("Error uploading file", err);
                    res.status(500).json({ error: "Error uploading file", details: err.message });
                });
        } catch (err) {
            console.error("Upload failed", err);
            res.status(500).json({ error: "Error uploading file", details: err.message });
        }
    }); */

    router.get(`${imagePrefix}/:filename`, async (req, res) => {
        const { filename } = req.params;

        try {
            const file = await bucket.find({ filename }).toArray(); // Find file in GridFS by filename

            if (!file || file.length === 0) {
                return res.status(404).json({ error: "Image not found" }); // Handle file not found
            }

            const downloadStream = bucket.openDownloadStream(file[0]._id); // Open stream to download the image
            res.set('Content-Type', file[0].metadata.type); // Set the image MIME type
            downloadStream.pipe(res); // Pipe the image stream to the response
        } catch (err) {
            console.error("Error fetching image from GridFS", err);
            res.status(500).json({ error: "Error fetching image", details: err.message });
        }
    });

    // Ensure the backend returns the image URL correctly
    router.get(`${imagePrefix}`, async (req, res) => {
        try {
            const images = await db.collection('imageAPI').find().toArray(); // Fetch image metadata from MongoDB

            // For each image, fetch additional data like size and type from GridFS using the fileId
            const imageDetails = await Promise.all(images.map(async (image) => {
                const file = await bucket.find({ _id: image.fileId }).toArray(); // Fetch the file details from GridFS

                if (file && file.length > 0) {
                    const fileMetadata = file[0].metadata;
                    return {
                        ...image,
                        size: fileMetadata.size,  // Add the file size
                        type: fileMetadata.type   // Add the file type
                    };
                } else {
                    return {
                        ...image,
                        size: null,  // Fallback if file not found
                        type: null   // Fallback if file not found
                    };
                }
            }));

            res.json({ images: imageDetails }); // Return the extended metadata with 'size' and 'type'
        } catch (err) {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Error fetching images" });
        }
    });


    /* router.get(`${imagePrefix}`, async (req, res) => {
        try {
            const images = await db.collection('imageAPI').find().toArray(); // Fetch image metadata from MongoDB
            res.json({ images }); // Return an array of image metadata with 'url' field
        } catch (err) {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Error fetching images" });
        }
    }); */


    // Update image or its label by ID
    router.post(`${imagePrefix}/update/:_id`, upload.single('file'), async (req, res) => {
        const { _id } = req.params;
        const { label = '' } = req.body;
        const { file } = req;

        // Validate the label length
        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        // Validate the uploaded file if it exists
        if (file) {
            const validation = validateFile(file);
            if (!validation.isValid) {
                return res.status(400).json({ error: "Invalid file type", message: validation.message });
            }
        }

        try {
            // Fetch the image metadata from 'imageAPI' collection
            const image = await db.collection('imageAPI').findOne({ _id: new ObjectId(_id) });

            if (!image) {
                return res.status(404).json({ error: "Image not found" });
            }

            // Handle file update if a new file is uploaded
            if (file) {
                // Delete the old file from GridFS (if present)
                await bucket.delete(image.fileId);

                const filePath = `${Date.now()}-${file.originalname}`;

                const uploadStream = bucket.openUploadStream(filePath, {
                    chunkSizeBytes: chunkValue,
                    metadata: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        label: label,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                    }
                });

                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        // Update image metadata with only the fileId, url, and label
                        await db.collection('imageAPI').updateOne(
                            { _id: new ObjectId(_id) },
                            {
                                $set: {
                                    fileId: uploadStream.id,
                                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                                    label: label
                                }
                            }
                        );

                        res.json({ message: "Image updated successfully", filePath });
                    })
                    .on("error", (err) => {
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });
            } else {
                // If no new file is uploaded, just update the label
                await db.collection('imageAPI').updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: { label: label } }
                );
                res.json({ message: "Label updated successfully" });
            }
        } catch (err) {
            res.status(500).json({ error: "Error updating image", details: err.message });
        }
    });


    // Delete file from GridFS and remove its metadata from imageAPI
    router.post(`${imagePrefix}/del/:_id`, async (req, res) => {
        const { _id } = req.params;

        try {
            // Find the image metadata from the imageAPI collection using _id
            const image = await db.collection('imageAPI').findOne({ _id: new ObjectId(_id) });

            if (!image) {
                return res.status(404).json({ error: "Image not found" });
            }

            // Delete the file from GridFS
            await bucket.delete(image.fileId);

            // Remove the metadata from the imageAPI collection
            await db.collection('imageAPI').deleteOne({ _id: new ObjectId(_id) });

            // Optionally, remove the file from fs.files and fs.chunks explicitly (if needed)
            // This is handled automatically by GridFS, but you can clean them manually if desired
            await db.collection('fs.files').deleteOne({ _id: new ObjectId(image.fileId) });
            await db.collection('fs.chunks').deleteMany({ files_id: new ObjectId(image.fileId) });

            res.json({ message: "File and metadata deleted successfully" });
        } catch (err) {
            console.error("Error deleting image", err);
            res.status(500).json({ error: "Error deleting image", details: err.message });
        }
    });

    return router;
};




/* const express = require("express");
const mongodb = require("mongodb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { connectToDatabase } = require("./config/Connect_db");

const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

const router = express.Router();

// Set up multer disk storage for file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create an instance of multer to handle file uploads
const upload = multer({ storage });

module.exports = function (dbName = "image", commonRoute = "/image", maxImageSize = "5MB", chunk_Value = 15728640) {
    const chunkValue = chunk_Value;  // 1 MB = 1048576 bytes & 15 MB = 15728640 bytes 
    const imagePrefix = commonRoute;
    const maxSize = maxImageSize;

    let db, bucket;
    const initDb = async () => {
        try {
            db = await connectToDatabase(dbName);
            bucket = new mongodb.GridFSBucket(db);
            console.log("MongoDB connected.");
        } catch (err) {
            console.error("MongoDB connection failed:", err);
            process.exit(1);
        }
    };

    initDb();

    // Utility to convert human-readable size strings into bytes
    const parseFileSize = (sizeString) => {
        const sizeRegex = /^(\d+)(KB|MB|GB|TB|B)$/i;
        const match = sizeString.match(sizeRegex);

        if (!match) {
            throw new Error("Invalid size format. Use KB, MB, GB, or TB.");
        }

        const size = parseInt(match[1], 10);
        const unit = match[2].toUpperCase();

        switch (unit) {
            case 'B': return size;
            case 'KB': return size * 1024;
            case 'MB': return size * 1024 * 1024;
            case 'GB': return size * 1024 * 1024 * 1024;
            case 'TB': return size * 1024 * 1024 * 1024 * 1024;
            default: throw new Error("Unsupported size unit.");
        }
    };

    // Utility to handle file validation
    const validateFile = (file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedImageExtensions.includes(fileExtension)) {
            return { isValid: false, message: "Only image files (jpg, jpeg, png, gif, bmp, webp) are allowed." };
        }

        const maxSizeInBytes = parseFileSize(maxSize);

        if (file.size > maxSizeInBytes) {
            return { isValid: false, message: `Image size exceeds the ${maxSize} limit.` };
        }
        return { isValid: true };
    };

    // ** Image Upload Route (using multer) **
    router.post(`${imagePrefix}`, upload.single('file'), async (req, res) => {
        const { file } = req;
        const { label = '' } = req.body;

        const validation = validateFile(file);
        if (!validation.isValid) {
            return res.status(400).json({ error: "Invalid file type", message: validation.message });
        }

        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        const filePath = `${Date.now()}-${file.originalname}`;

        try {
            const uploadStream = bucket.openUploadStream(filePath, {
                chunkSizeBytes: chunkValue,
                metadata: {
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    label: label,
                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`  // Ensure the correct URL
                }
            });

            fs.createReadStream(file.path)
                .pipe(uploadStream)
                .on("finish", async () => {
                    const imageMetadata = {
                        fileId: uploadStream.id,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                        label: label
                    };

                    try {
                        await db.collection('imageAPI').insertOne(imageMetadata);
                        res.json({ message: "File uploaded successfully", filePath });
                    } catch (err) {
                        console.error("Error inserting into imageAPI", err);
                        res.status(500).json({ error: "Error storing image metadata", details: err.message });
                    }
                })
                .on("error", (err) => {
                    console.error("Error uploading file", err);
                    res.status(500).json({ error: "Error uploading file", details: err.message });
                });
        } catch (err) {
            console.error("Upload failed", err);
            res.status(500).json({ error: "Error uploading file", details: err.message });
        }
    });

    // Route for fetching image by filename from GridFS
    router.get(`${imagePrefix}/:filename`, async (req, res) => {
        const { filename } = req.params;
    
        try {
            const file = await bucket.find({ filename }).toArray(); // Find file in GridFS by filename
            
            if (!file || file.length === 0) {
                return res.status(404).json({ error: "Image not found" }); // Handle file not found
            }
    
            const downloadStream = bucket.openDownloadStream(file[0]._id); // Open stream to download the image
            res.set('Content-Type', file[0].metadata.type); // Set the image MIME type
            downloadStream.pipe(res); // Pipe the image stream to the response
        } catch (err) {
            console.error("Error fetching image from GridFS", err);
            res.status(500).json({ error: "Error fetching image", details: err.message });
        }
    });

    // Ensure the backend returns the image URL correctly
    router.get(`${imagePrefix}`, async (req, res) => {
        try {
            const images = await db.collection('imageAPI').find().toArray(); // Fetch image metadata from MongoDB
            res.json({ images }); // Return an array of image metadata with 'url' field
        } catch (err) {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Error fetching images" });
        }
    });

    // Update image or its label by ID
    router.post(`${imagePrefix}/update/:_id`, upload.single('file'), async (req, res) => {
        const { _id } = req.params;
        const { label = '' } = req.body;
        const { file } = req;
    
        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }
    
        if (file) {
            const validation = validateFile(file);
            if (!validation.isValid) {
                return res.status(400).json({ error: "Invalid file type", message: validation.message });
            }
        }
    
        try {
            const image = await db.collection('imageAPI').findOne({ _id: new ObjectId(_id) });
    
            if (!image) {
                return res.status(404).json({ error: "Image not found" });
            }
    
            if (file) {
                await bucket.delete(image.fileId);
    
                const filePath = `${Date.now()}-${file.originalname}`;
    
                const uploadStream = bucket.openUploadStream(filePath, {
                    chunkSizeBytes: chunkValue,
                    metadata: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        label: label,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`  // Ensure the correct URL
                    }
                });
    
                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        await db.collection('imageAPI').updateOne(
                            { _id: new ObjectId(_id) },
                            { $set: { 
                                fileId: uploadStream.id,
                                url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                                label: label
                            } }
                        );
                        res.json({ message: "Image updated successfully", filePath });
                    })
                    .on("error", (err) => {
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });
            } else {
                await db.collection('imageAPI').updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: { label: label } }
                );
                res.json({ message: "Label updated successfully" });
            }
        } catch (err) {
            res.status(500).json({ error: "Error updating image", details: err.message });
        }
    });

    // Delete file from GridFS and remove its metadata from imageAPI
    router.post(`${imagePrefix}/del/:_id`, async (req, res) => {
        const { _id } = req.params;

        try {
            const image = await db.collection('imageAPI').findOne({ _id: new ObjectId(_id) });

            if (!image) {
                return res.status(404).json({ error: "Image not found" });
            }

            await bucket.delete(image.fileId);
            await db.collection('imageAPI').deleteOne({ _id: new ObjectId(_id) });

            await db.collection('fs.files').deleteOne({ _id: new ObjectId(image.fileId) });
            await db.collection('fs.chunks').deleteMany({ files_id: new ObjectId(image.fileId) });

            res.json({ message: "File and metadata deleted successfully" });
        } catch (err) {
            console.error("Error deleting image", err);
            res.status(500).json({ error: "Error deleting image", details: err.message });
        }
    });

    return router;
};
 */



/* const express = require("express");
const mongodb = require("mongodb");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require('mongoose');
const { connectToDatabase } = require("../config/Connect_db");

const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// MongoDB connection setup
const initDb = async (dbName) => {
    try {
        const db = await connectToDatabase(dbName);
        const bucket = new mongodb.GridFSBucket(db);
        console.log("MongoDB connected.");
        return bucket;
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

const parseFileSize = (sizeString) => {
    const sizeRegex = /^(\d+)(KB|MB|GB|TB|B)$/i;
    const match = sizeString.match(sizeRegex);

    if (!match) {
        throw new Error("Invalid size format. Use KB, MB, GB, or TB.");
    }

    const size = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case 'B': return size;
        case 'KB': return size * 1024;
        case 'MB': return size * 1024 * 1024;
        case 'GB': return size * 1024 * 1024 * 1024;
        case 'TB': return size * 1024 * 1024 * 1024 * 1024;
        default: throw new Error("Unsupported size unit.");
    }
};

const validateFile = (file, maxSize) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedImageExtensions.includes(fileExtension)) {
        return { isValid: false, message: "Only image files (jpg, jpeg, png, gif, bmp, webp) are allowed." };
    }

    const maxSizeInBytes = parseFileSize(maxSize);

    if (file.size > maxSizeInBytes) {
        return { isValid: false, message: `Image size exceeds the ${maxSize} limit.` };
    }
    return { isValid: true };
};

module.exports = function (dbName = "image", commonRoute = "/image", maxImageSize = "5MB", chunk_Value = 15728640) {
    const chunkValue = chunk_Value;
    const imagePrefix = commonRoute;
    const maxSize = maxImageSize;

    let bucket;
    const init = async () => {
        bucket = await initDb(dbName);
    };

    init();

    // Image Upload Route
    router.post(`${imagePrefix}`, upload.single('file'), async (req, res) => {
        const { file } = req;
        const { label = '' } = req.body;

        const validation = validateFile(file, maxSize);
        if (!validation.isValid) {
            return res.status(400).json({ error: "Invalid file type", message: validation.message });
        }

        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        const filePath = `${Date.now()}-${file.originalname}`;

        try {
            const uploadStream = bucket.openUploadStream(filePath, {
                chunkSizeBytes: chunkValue,
                metadata: {
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    label: label,
                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                }
            });

            fs.createReadStream(file.path)
                .pipe(uploadStream)
                .on("finish", async () => {
                    // No schema/model used, just storing metadata here
                    const imageMetadata = {
                        fileId: uploadStream.id,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                        label: label,
                        fileName: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                    };

                    try {
                        // Save the metadata in a custom collection (if necessary) without using Mongoose model
                        await bucket.db.collection('images').insertOne(imageMetadata);
                        res.json({ message: "File uploaded successfully", filePath });
                    } catch (err) {
                        console.error("Error inserting into Image collection", err);
                        res.status(500).json({ error: "Error storing image metadata", details: err.message });
                    }
                })
                .on("error", (err) => {
                    console.error("Error uploading file", err);
                    res.status(500).json({ error: "Error uploading file", details: err.message });
                });
        } catch (err) {
            console.error("Upload failed", err);
            res.status(500).json({ error: "Error uploading file", details: err.message });
        }
    });

    // Get all images
    router.get(`${imagePrefix}`, async (req, res) => {
        try {
            // Fetch all image records from the custom 'images' collection
            const images = await bucket.db.collection('images').find().sort({ createdAt: -1 }).toArray();

            if (images.length === 0) {
                return res.status(404).json({ error: "No images found" });
            }

            // Send the image list as a response
            res.json({ images });
        } catch (err) {
            console.error("Error fetching images", err);
            res.status(500).json({ error: "Error fetching images", details: err.message });
        }
    });

    // Update image label and/or image by ID
    router.post(`${imagePrefix}/update/:_id`, upload.single('file'), async (req, res) => {
        const { _id } = req.params;
        const { label = '' } = req.body;
        const { file } = req;

        if (file) {
            const validation = validateFile(file, maxSize);
            if (!validation.isValid) {
                return res.status(400).json({ error: "Invalid file type", message: validation.message });
            }
        }

        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        try {
            const image = await bucket.db.collection('images').findOne({ _id: new ObjectId(_id) });
            if (!image) {
                return res.status(404).json({ error: "Image not found" });
            }

            if (file) {
                await bucket.delete(image.fileId);

                const filePath = `${Date.now()}-${file.originalname}`;

                const uploadStream = bucket.openUploadStream(filePath, {
                    chunkSizeBytes: chunkValue,
                    metadata: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        label: label,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                    }
                });

                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        image.fileId = uploadStream.id;
                        image.url = `http://${req.headers.host}${imagePrefix}/${filePath}`;
                        image.label = label;
                        image.fileName = file.originalname;
                        image.size = file.size;
                        image.type = file.mimetype;

                        try {
                            await bucket.db.collection('images').updateOne({ _id: new ObjectId(_id) }, { $set: image });
                            res.json({ message: "Image updated successfully", filePath });
                        } catch (err) {
                            res.status(500).json({ error: "Error updating image metadata", details: err.message });
                        }
                    })
                    .on("error", (err) => {
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });
            } else {
                image.label = label;
                try {
                    await bucket.db.collection('images').updateOne({ _id: new ObjectId(_id) }, { $set: image });
                    res.json({ message: "Label updated successfully" });
                } catch (err) {
                    res.status(500).json({ error: "Error updating image label", details: err.message });
                }
            }
        } catch (err) {
            res.status(500).json({ error: "Error updating image", details: err.message });
        }
    });

    // Delete image by ID
    router.post(`${imagePrefix}/del/:_id`, async (req, res) => {
        const { _id } = req.params;

        try {
            const deletedImage = await bucket.db.collection('images').findOneAndDelete({ _id: new ObjectId(_id) });
            if (!deletedImage.value) {
                return res.status(404).json({ error: "Image not found" });
            }

            await bucket.delete(deletedImage.value.fileId);

            res.json({ message: "Image and metadata deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: "Error deleting image", details: err.message });
        }
    });

    return router;
};
 */