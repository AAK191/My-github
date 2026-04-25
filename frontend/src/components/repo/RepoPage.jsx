import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import CommitGraph from "../dashboard/CommitGraph";
import FileTree from "./FileTree";
import "./RepoPage.css";

const RepoPage = () => {
    const { id } = useParams();
    const [repo, setRepo] = useState(null);
    const navigate = useNavigate();

    const loggedInUserId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchRepo = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/repo/${id}`);
                setRepo(response.data);
            } catch (err) {
                console.error("Error fetching repo:", err);
            }
        };
        fetchRepo();
    }, [id]);

    if (!repo) return <><Navbar /><p style={{ color: "white", padding: "2rem" }}>Loading...</p></>;

    const ownerId = repo.owner?._id || repo.owner;
    const ownerName = repo.owner?.username || "Unknown";
    const isOwner = loggedInUserId === ownerId;

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${repo.name}"? This cannot be undone.`);
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:3000/repo/delete/${id}`);
            navigate("/");
        } catch (err) {
            console.error("Error deleting repo:", err);
            alert("Failed to delete repository");
        }
    };

    return (
        <>
            <Navbar />

            {/* Repo Info */}
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1 style={{ color: "white" }}>{repo.name}</h1>
                <p style={{ color: "#8b949e" }}>{repo.description}</p>
                <small style={{ color: "#8b949e" }}>
                    {repo.visibility ? "🔓 Public" : "🔒 Private"}
                </small>

                {/* Owner Card */}
                <div style={{ marginTop: "1rem" }}>
                    <div
                        onClick={() => navigate(`/profile/${ownerId}`)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 14px",
                            backgroundColor: "#161b22",
                            border: "1px solid #30363d",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "#58a6ff",
                        }}
                    >
                        <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            backgroundColor: "#238636", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: "13px", color: "white"
                        }}>
                            {ownerName[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: "14px" }}>View {ownerName}'s Profile</span>
                    </div>
                </div>
            </div>

            {/* File Tree — handles all file adding internally */}
            <div style={{ padding: "0 2rem" }}>
                <FileTree repoId={id} isOwner={isOwner} userId={ownerId} />
            </div>

            {/* Commit Graph */}
            <CommitGraph repoId={id} />

            {isOwner && (
                <div className="repo-delete-container">
                    <button onClick={handleDelete} className="repo-delete-btn">
                        🗑️ Delete Repository
                    </button>
                </div>
            )}
        </>
    );
};

export default RepoPage;