import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles.css';

function App() {
  const [image, setImage] = useState(null);
  const [blobNames, setBlobNames] = useState([]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
  
      await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('Image uploaded successfully');
  
      // Wait for 5 seconds before fetching updated blob names
      setTimeout(async () => {
        const response = await axios.get('http://localhost:3001/blobs');
        setBlobNames(response.data);
      }, 2000);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  useEffect(() => {
    const fetchBlobNames = async () => {
      try {
        const response = await axios.get('http://localhost:3001/blobs');
        setBlobNames(response.data);
      } catch (error) {
        console.error('Error fetching blob names:', error);
      }
    };

    fetchBlobNames();
  }, []);

  return (
    <div className="container">
      <input type="file" name="image" onChange={handleImageChange} />
      <div className="buttons-container">
        <button onClick={handleUpload}>Upload Image</button>
        {/* Add another button if needed */}
      </div>
      <div>
        <table>
          <tbody>
          <th>File Name</th>
          <th>Description</th>
            {blobNames.map((blob) => (
              <tr key={blob.name}>
                <td>{blob.name}</td>
                <td>{blob.tag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;