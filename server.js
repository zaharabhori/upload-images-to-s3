require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
const dotenv = require('dotenv');  // Import dotenv to load the environment variables
const app = express();
const port = 3000;

// Load environment variables from .env file
dotenv.config();

// Initialize AWS SDK with credentials from environment variables
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Use the environment variable
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Use the environment variable
    region: process.env.AWS_REGION,  // Use the environment variable
});

const s3 = new AWS.S3();

// Middleware to serve static files (like HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to generate a pre-signed URL
app.get('/generate-presigned-url', (req, res) => {
    const fileName = req.query.filename;
    const fileType = req.query.filetype;

    const params = {
        Bucket: process.env.AWS_BUCKET,  // Your S3 bucket name
        Key: `${Date.now()}-${fileName}`, // Unique file name
        Expires: 3600, // URL expires in 5 minutes
        ContentType: fileType, // Content type of the file
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            return res.status(500).json({ error: 'Error generating pre-signed URL' });
        }
        res.json({ url });
    });
});

app.get('/generate-access-url', (req, res) => {
    const { key } = req.query;

    if (!key) {
        return res.status(400).json({ error: 'Key is required' });
    }

    const params = {
        Bucket: 'crumbcoat.bucket', // Your S3 bucket name
        Key: key, // Object key (path + name)
        Expires: 3600, // URL valid for 1 hour
    };

    s3.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
            console.error('Error generating pre-signed URL for access:', err);
            return res.status(500).json({ error: 'Error generating pre-signed URL for access' });
        }
        res.json({ url });
    });
});

// Route to list all objects in the bucket
app.get('/list-images', async (req, res) => {
    try {
        const params = {
            Bucket: 'crumbcoat.bucket',
            //Prefix: 'pics/', // Folder where the images are stored
        };

        const data = await s3.listObjectsV2(params).promise();

        // Construct public URLs for each file
        const imageUrls = data.Contents.map((item) => item.Key);

        res.json({ imageUrls });
    } catch (error) {
        console.error('Error listing objects:', error);
        res.status(500).json({ error: 'Failed to list images' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
