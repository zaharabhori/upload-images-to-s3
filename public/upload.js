const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const messageDiv = document.getElementById('message');

const SERVER_URL = 'http://localhost:3000/generate-presigned-url'; // URL for your API endpoint

const imageListDiv = document.getElementById('imageList'); // New div to display images

const fetchAndDisplayImages = async () => {
    try {
        const response = await fetch('/list-images'); // Fetch the image URLs from the backend
        const { imageUrls } = await response.json();

        // Clear the current image list
        imageListDiv.innerHTML = '';

        //Add each image URL to the list
        imageUrls.forEach((name) => {
            // const imgElement = document.createElement('img');
            // imgElement.src = url;
            // imgElement.alt = 'Uploaded Image';
            // imgElement.style.width = '150px'; // Resize for better display
            // imgElement.style.margin = '10px';
            // imageListDiv.appendChild(imgElement);

            // Optional: Add a clickable link below the image
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.textContent = name;
            linkElement.target = '_blank'; // Open in a new tab
            linkElement.style.display = 'block'; // Add space between images
            linkElement.style.marginBottom = '10px';

            // Add click event to fetch and open pre-signed URL
            linkElement.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent default anchor behavior

                try {
                    // Fetch pre-signed URL for the clicked object
                    const urlResponse = await fetch(`/generate-access-url?key=${encodeURIComponent(name)}`);
                    if (!urlResponse.ok) {
                        throw new Error('Failed to fetch pre-signed URL');
                    }

                    const { url } = await urlResponse.json();

                    // Open the pre-signed URL in a new tab
                    window.open(url, '_blank');
                } catch (error) {
                    console.error('Error fetching pre-signed URL:', error);
                    alert('Failed to open the file. Check console for details.');
                }
            });


            // Append the link to the imageListDiv
            imageListDiv.appendChild(linkElement);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

// Fetch and display images when the page loads
window.onload = fetchAndDisplayImages;

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
            fetchAndDisplayImages(); 
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        messageDiv.textContent = 'Error uploading file. Check the console for details.';
    }
});
