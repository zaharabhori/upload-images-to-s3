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
    region: 'ap-south-1',  // Use the environment variable
});

const s3 = new AWS.S3();

// Middleware to serve static files (like HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to generate a pre-signed URL
app.get('/generate-presigned-url', (req, res) => {
    const fileName = req.query.filename;
    const fileType = req.query.filetype;

    const params = {
        Bucket: 'crumbcoat.bucket',  // Your S3 bucket name
        Key: `pics/${Date.now()}-${fileName}`, // Unique file name
        Expires: 60 * 5, // URL expires in 5 minutes
        ContentType: fileType, // Content type of the file
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            return res.status(500).json({ error: 'Error generating pre-signed URL' });
        }
        res.json({ url });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
