console.log('JavaScript Project Initialized!');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const messageDiv = document.getElementById('message');

const S3_BUCKET_URL = 'https://your-bucket-name.s3.amazonaws.com'; // Replace with your bucket URL
const AWS_ACCESS_KEY_ID = 'your-access-key-id'; // Replace with your AWS Access Key
const AWS_SECRET_ACCESS_KEY = 'your-secret-access-key'; // Replace with your AWS Secret Key
const REGION = 'your-region'; // Replace with your S3 bucket's region

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
        messageDiv.textContent = 'Please select a file!';
        return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const uploadUrl = `${S3_BUCKET_URL}/${fileName}`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
                'x-amz-acl': 'public-read',
            },
            body: file,
        });

        if (response.ok) {
            messageDiv.textContent = `File uploaded successfully! URL: ${uploadUrl}`;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        messageDiv.textContent = 'Error uploading file. Check the console for details.';
    }
});
