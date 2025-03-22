const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API endpoint to handle image uploads and PDF conversion
app.post('/api/convert', upload.array('images'), (req, res) => {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, 'output.pdf');
  const writeStream = fs.createWriteStream(pdfPath);

  doc.pipe(writeStream);

  // Add each uploaded image to the PDF
  req.files.forEach((file) => {
    doc.addPage().image(file.path, {
      fit: [500, 500],
      align: 'center',
      valign: 'center',
    });
  });

  doc.end();

  writeStream.on('finish', () => {
    res.download(pdfPath, 'converted.pdf', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error downloading PDF');
      }
      // Clean up: delete uploaded files and generated PDF
      req.files.forEach((file) => fs.unlinkSync(file.path));
      fs.unlinkSync(pdfPath);
    });
  });
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
  }

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});