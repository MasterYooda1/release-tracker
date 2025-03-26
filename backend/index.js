const express = require('express');
const cors = require('cors'); // Import CORS
const fs = require('fs');

const app = express();
const PORT = 5000;

// Enable CORS for all origins (you can restrict it later if needed)
app.use(cors({
    origin: 'http://localhost:3000', // Allow only your frontend
    credentials: true               // Allow credentials (cookies, etc.)
}));

// Middleware to parse JSON requests
app.use(express.json());

// Your file path
const FILE_PATH = '../src/releases.json';

// DELETE route to remove a release by id
app.delete('/api/releases/:id', (req, res) => {
    const releaseId = parseInt(req.params.id, 10); // Extract release ID from the URL parameter
    console.log("Received release ID:", releaseId);
    // Read the current content of releases.json
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading the file' });
        }

        let releases = JSON.parse(data); // Parse the existing releases

        // Filter out the release with the given id
        const updatedReleases = releases.filter(release => release.id !== releaseId);

        // If no release was found with that id
        if (releases.length === updatedReleases.length) {
            return res.status(404).json({ error: 'Release not found' });
        }

        // Write the updated releases array back to the file
        fs.writeFile(FILE_PATH, JSON.stringify(updatedReleases, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to file' });
            }

            res.json({ message: 'Release deleted successfully!', updatedReleases });
        });
    });
});

// Example route to add a new release
app.post('/api/releases', (req, res) => {
    const newRelease = req.body;

    // Debugging: log the incoming request data
    console.log("Received release:", newRelease);

    // Read the current content of releases.json
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        let releases = [];

        // If the file exists, parse it, otherwise start with an empty array
        if (!err && data) {
            releases = JSON.parse(data);
        }

        releases.push(newRelease); // Add the new release to the array

        // Write the updated releases array to the JSON file
        fs.writeFile(FILE_PATH, JSON.stringify(releases, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error writing to file' });
            }
            res.json({ message: 'Release added successfully! BE ', releases });
        });
    });
});

// Start the backend server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
