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
    //     cb(null, uploadDir);  // Set the upload directory
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
    router.post(`${imagePrefix}`, upload.array('files'), async (req, res) => {
        const files = req.files;  // Array of uploaded files
        const { labels = [], titles = [] } = req.body; // Labels and titles as arrays

        // Ensure we have the same number of labels and titles as files
        if (files.length !== labels.length || files.length !== titles.length) {
            return res.status(400).json({ error: "Mismatch between number of files, labels, and titles" });
        }

        try {
            // Loop through each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const label = labels[i] || '';  // Default empty if no label provided
                const title = titles[i] || '';  // Default empty if no title provided

                const validation = validateFile(file);
                if (!validation.isValid) {
                    return res.status(400).json({ error: "Invalid file type", message: validation.message });
                }

                if (label.length > 50000) {
                    return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
                }

                if (title.length > 255) {
                    return res.status(400).json({ error: "Invalid title", message: "Title cannot be longer than 255 characters." });
                }

                const filePath = `${Date.now()}-${file.originalname}`;

                const uploadStream = bucket.openUploadStream(filePath, {
                    chunkSizeBytes: chunkValue,
                    metadata: {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        label: label,
                        title: title,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                    }
                });

                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        const imageMetadata = {
                            fileId: uploadStream.id,
                            url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                            label: label,
                            title: title
                        };

                        try {
                            await db.collection('imageAPI').insertOne(imageMetadata);
                        } catch (err) {
                            console.error("Error inserting into imageAPI", err);
                            res.status(500).json({ error: "Error storing image metadata", details: err.message });
                        }
                    })
                    .on("error", (err) => {
                        console.error("Error uploading file", err);
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });
            }

            res.json({ message: "Files uploaded successfully" });

        } catch (err) {
            console.error("Upload failed", err);
            res.status(500).json({ error: "Error uploading files", details: err.message });
        }
    });


    /* router.post(`${imagePrefix}`, upload.single('file'), async (req, res) => {
        const { file } = req;
        const { label = '', title = '' } = req.body; // Include title

        const validation = validateFile(file);
        if (!validation.isValid) {
            return res.status(400).json({ error: "Invalid file type", message: validation.message });
        }

        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        if (title.length > 255) {
            return res.status(400).json({ error: "Invalid title", message: "Title cannot be longer than 255 characters." });
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
                    title: title, // Include title here in GridFS metadata
                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                }
            });

            fs.createReadStream(file.path)
                .pipe(uploadStream)
                .on("finish", async () => {
                    const imageMetadata = {
                        fileId: uploadStream.id,
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                        label: label,
                        title: title // Include title here in imageAPI metadata
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


    /*   router.get(`${imagePrefix}`, async (req, res) => {
        try {
            const images = await db.collection('imageAPI').find().toArray(); // Fetch image metadata from MongoDB
            res.json({ images }); // Return an array of image metadata with 'url' field
        } catch (err) {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Error fetching images" });
        }
    }); */


    // Update image or its label/title by ID
    router.post(`${imagePrefix}/update/:_id`, upload.single('file'), async (req, res) => {
        const { _id } = req.params;
        const { label = '', title = '' } = req.body; // Include title
        const { file } = req;

        // Validate the label and title length
        if (label.length > 50000) {
            return res.status(400).json({ error: "Invalid label", message: "Label cannot be longer than 50000 characters." });
        }

        if (title.length > 255) {
            return res.status(400).json({ error: "Invalid title", message: "Title cannot be longer than 255 characters." });
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
                        title: title, // Include title here in GridFS metadata
                        url: `http://${req.headers.host}${imagePrefix}/${filePath}`
                    }
                });

                fs.createReadStream(file.path)
                    .pipe(uploadStream)
                    .on("finish", async () => {
                        // Update image metadata with only the fileId, url, label, and title
                        await db.collection('imageAPI').updateOne(
                            { _id: new ObjectId(_id) },
                            {
                                $set: {
                                    fileId: uploadStream.id,
                                    url: `http://${req.headers.host}${imagePrefix}/${filePath}`,
                                    label: label,
                                    title: title // Include title here in imageAPI metadata
                                }
                            }
                        );

                        res.json({ message: "Image updated successfully", filePath });
                    })
                    .on("error", (err) => {
                        res.status(500).json({ error: "Error uploading file", details: err.message });
                    });
            } else {
                // If no new file is uploaded, just update the label and title
                await db.collection('imageAPI').updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: { label: label, title: title } }
                );
                res.json({ message: "Label and title updated successfully" });
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
