const express = require('express');
const multer = require('multer');
const azureStorage = require('azure-storage');
const cors = require('cors'); // Add this line
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

const azureConnectionString = process.env.AZURE_CONNECTION_STRING;
const containerName = 'images';

const blobService = azureStorage.createBlobService(azureConnectionString);


app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error uploading image to Azure Blob Storage' });
      }
      const blobName = Date.now() + '-' + req.file.originalname;
  
      blobService.createBlockBlobFromText(containerName, blobName, req.file.buffer, (error, result, response) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Error uploading image to Azure Blob Storage' });
        } else {
          res.status(200).json({ message: 'Image uploaded successfully' });
        }
      });
    });
});

app.get('/blobs', (req, res) => {
    blobService.listBlobsSegmented(containerName, null, {include: "metadata"},(error, result, response) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching blob names from Azure Blob Storage' });
      } else {
        const images = result.entries.map((azureBlob) => {
          var tag = ""

          if (azureBlob.metadata)
          {
             tag = azureBlob.metadata['image_tag']
          }
          else 
          {
            console.log("undefined")
          }
          return {name: azureBlob.name, tag: tag} 
          });
        res.status(200).json(images);
      }
    });
  });

app.use(cors());
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

