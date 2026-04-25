import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRepository.css"; 

const CreateRepository = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get userId from localStorage (adjust based on how you store it)
  const userId = localStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/repo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Navigate to the new repo page after creation
      navigate(`/repo/${data.repositoryID}`);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="repo-wrapper">
    <div className="repo-card">
      <h2>Create a New Repository</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Repository Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="my-awesome-repo"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="visibility"
            checked={formData.visibility}
            onChange={handleChange}
          />
          <span>Public repository</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>

      </form>
    </div>
  </div>
 );
};

export default CreateRepository;