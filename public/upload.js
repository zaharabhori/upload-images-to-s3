const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const messageDiv = document.getElementById('message');

const SERVER_URL = 'http://localhost:3000/generate-presigned-url'; // URL for your API endpoint

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
        messageDiv.textContent = 'Please select a file!';
        return;
    }

    try {
        // Step 1: Fetch pre-signed URL from the server
        const response = await fetch(`${SERVER_URL}?filename=${file.name}&filetype=${file.type}`);
        const { url } = await response.json();

        if (!url) {
            throw new Error('Failed to get pre-signed URL');
        }

        // Step 2: Upload the file to S3 using the pre-signed URL
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (uploadResponse.ok) {
            const uploadedFileUrl = url.split('?')[0]; // Get the URL without the query params
            messageDiv.textContent = `File uploaded successfully! URL: ${uploadedFileUrl}`;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        messageDiv.textContent = 'Error uploading file. Check the console for details.';
    }
});
