import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Handle file drop/upload
  const onDrop = useCallback((acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  // Handle PDF conversion
  const handleConvert = async () => {
    if (images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    try {
      const response = await axios.post('/api/convert', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPdfUrl(url);
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('Failed to convert images to PDF.');
    }
  };

  // Remove an image from the list
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="App">
      <h1>Image to PDF Maker</h1>
      <div
        {...getRootProps()}
        className="dropzone"
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          margin: '20px 0',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>

      {/* Image Previews */}
      <div className="image-preview">
        {images.map((image, index) => (
          <div key={index} style={{ display: 'inline-block', margin: '10px' }}>
            <img
              src={URL.createObjectURL(image)}
              alt={`preview-${index}`}
              style={{ maxWidth: '100px', maxHeight: '100px' }}
            />
            <button onClick={() => removeImage(index)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Convert Button */}
      <button onClick={handleConvert} style={{ padding: '10px 20px' }}>
        Convert to PDF
      </button>

      {/* Download Link */}
      {pdfUrl && (
        <div>
          <a href={pdfUrl} download="converted.pdf">
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

export default App;