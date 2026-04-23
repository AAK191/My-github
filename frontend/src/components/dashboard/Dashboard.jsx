import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // ✅ imported
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");  // ✅ defined

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
        const others = data.filter(repo => {
          const ownerId = repo.owner?._id || repo.owner;
          return ownerId?.toString() !== loggedInUserId;  // ✅ now defined
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
      setSearchResults(repositories.filter(repo =>
        repo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, repositories]);

  const handleSuggestedRepoClick = (repo) => {
    const ownerId = repo.owner?._id || repo.owner;
    navigate(`/profile/${ownerId}`);
  };

  return (
    <>
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
          <h2>Your Repositories</h2>
          <div id="search">
            <input type="text" value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {repositories.length === 0 && <p>No repositories yet. Create one!</p>}
          {searchResults.map((repo) => (
            <div key={repo._id} className="repo-card"
              onClick={() => navigate(`/repo/${repo._id}`)}
              style={{ cursor: "pointer" }}
            >
              <h4>{repo.name}</h4>
              <p>{repo.description}</p>
              <small>{repo.visibility ? "🔓 Public" : "🔒 Private"}</small>
            </div>
          ))}
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
    </>
  );
};

export default Dashboard;