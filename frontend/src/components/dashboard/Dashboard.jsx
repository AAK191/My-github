import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");

  const [allRepositories, setAllRepositories] = useState([]);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!loggedInUserId) return;
      try {
        const response = await fetch(`http://localhost:3000/repo/user/${loggedInUserId}`);
        if (!response.ok) return;
        const data = await response.json();
        setRepositories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching repositories:", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        const data = await response.json();
        console.log("All repos data:", data);
        console.log("First repo owner:", data[0]?.owner);
        setAllRepositories(Array.isArray(data) ? data : []);

        const others = data.filter(repo => {
          const ownerId = repo.owner?._id || repo.owner;
          return ownerId?.toString() !== loggedInUserId;
        });
        setSuggestedRepositories(others);
      } catch (err) {
        console.error("Error fetching suggested repositories:", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filtered = allRepositories.filter(repo =>
        repo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo?.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      ); setSearchResults(filtered);
    }
  }, [searchQuery, repositories, allRepositories]);

  const handleSuggestedRepoClick = (repo) => {
    navigate(`/repo/${repo._id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <section className="navbar-container">
        <Navbar />
      </section>
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.length === 0 && <p>No suggestions available</p>}
          {suggestedRepositories.map((repo) => {
            const ownerName = repo.owner?.username || "Unknown";  // ✅ defined in map
            return (
              <div key={repo._id} className="suggested-repo-card"
                onClick={() => handleSuggestedRepoClick(repo)}
                style={{ cursor: "pointer" }}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description}</p>
                <small>by {ownerName}</small>
              </div>
            );
          })}
        </aside>

        <main>
          <h2>{searchQuery ? "Search Results" : "Your Repositories"}</h2>  {/* ✅ dynamic title */}
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search repositories, descriptions, users..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchResults.length === 0 && searchQuery && (
            <p style={{ color: "#8b949e" }}>No repositories found for "{searchQuery}"</p>
          )}
          {repositories.length === 0 && !searchQuery && (
            <p>No repositories yet. Create one!</p>
          )}

          {searchResults.map((repo) => {
            
            const ownerName = repo.owner?.username || "Unknown";             return (
              <div
                key={repo._id}
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description"}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <small>{repo.visibility ? "Public" : "Private"}</small>
                  <small style={{ color: "#58a6ff" }}>by {ownerName}</small> {/* ✅ */}
                </div>
              </div>
            );
          })}
        </main>

        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li><p>Tech Conference - Dec 15</p></li>
            <li><p>Developer Meetup - Dec 25</p></li>
            <li><p>React Summit - Jan 5</p></li>
          </ul>
        </aside>
      </section>
    </div>
  );
};

export default Dashboard;