import React, { useState } from "react";

function App() {

  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    alert("File selected: " + file.name);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Upload Image</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload & Watermark
      </button>
    </div>
  );
}

export default App;