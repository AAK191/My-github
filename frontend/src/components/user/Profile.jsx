import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon, StarIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({ username: "username" });
    const { setCurrentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [userRepos, setUserRepos] = useState([]);

    const [showFollowing, setShowFollowing] = useState(false);
    const [followingUsers, setFollowingUsers] = useState([]);
    const [followingLoading, setFollowingLoading] = useState(false);


    const loggedInUserId = localStorage.getItem("userId");
    const profileUserId = userId || loggedInUserId;
    const isOwnProfile = profileUserId === loggedInUserId;

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!profileUserId) return;
            try {
                const response = await axios.get(
                    `http://localhost:3000/userProfile/${profileUserId}`
                );

                setUserDetails(response.data);
                setFollowerCount(response.data.followers?.length || 0);
                const alreadyFollowing = myRes.data.followedUsers?.some(
                    f => f.toString() === profileUserId
                );
                setIsFollowing(alreadyFollowing);
            } catch (err) {
                console.error("Cannot fetch user details: ", err);
            }
        };
        fetchUserDetails();
    }, [profileUserId]);

    useEffect(() => {
        const fetchUserRepos = async () => {
            if (!profileUserId) return;
            try {
                const response = await axios.get(
                    `http://localhost:3000/repo/user/${profileUserId}`
                );
                setUserRepos(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Cannot fetch repos: ", err);
            }
        };
        if (activeTab === "repositories") fetchUserRepos();
    }, [activeTab, profileUserId]);

    const handleFollow = async () => {
        console.log("Follow clicked!");                               // 👈 is it firing?
        console.log("profileUserId:", profileUserId);                 // 👈 target
        console.log("loggedInUserId:", loggedInUserId);
        try {
            const response = await axios.patch(
                `http://localhost:3000/userProfile/${profileUserId}/follow`,
                { currentUserId: loggedInUserId }
            );
            console.log("Follow API response:", response.data);       // 👈 what came back?
            setIsFollowing(response.data.following);
            setFollowerCount(prev => response.data.following ? prev + 1 : prev - 1);
        } catch (err) {
            console.error("Follow action failed: ", err);
        }
    };

    const fetchFollowingUsers = async () => {
        if (!isOwnProfile) return; // ✅ only owner can see
        setFollowingLoading(true);
        try {
            const myRes = await axios.get(`http://localhost:3000/userProfile/${loggedInUserId}`);
            const followedIds = myRes.data.followedUsers || [];

            // fetch each followed user's details
            const userPromises = followedIds.map(id =>
                axios.get(`http://localhost:3000/userProfile/${id}`)
            );
            const results = await Promise.all(userPromises);
            setFollowingUsers(results.map(r => r.data));
        } catch (err) {
            console.error("Error fetching following:", err);
        } finally {
            setFollowingLoading(false);
        }
    };
    return (
        <>
            <Navbar />

            {/* Tabs */}
            <UnderlineNav aria-label="Profile tabs">
                <UnderlineNav.Item
                    icon={BookIcon}
                    aria-current={activeTab === "overview" ? "page" : undefined}
                    onClick={() => setActiveTab("overview")}
                    sx={{ backgroundColor: "transparent", color: "white", cursor: "pointer" }}
                >
                    Overview
                </UnderlineNav.Item>

                <UnderlineNav.Item
                    icon={RepoIcon}
                    aria-current={activeTab === "repositories" ? "page" : undefined}
                    onClick={() => setActiveTab("repositories")}
                    sx={{ backgroundColor: "transparent", color: "whitesmoke", cursor: "pointer" }}
                >
                    Repositories
                </UnderlineNav.Item>

                <UnderlineNav.Item
                    icon={StarIcon}
                    aria-current={activeTab === "starred" ? "page" : undefined}
                    onClick={() => setActiveTab("starred")}
                    sx={{ backgroundColor: "transparent", color: "whitesmoke", cursor: "pointer" }}
                >
                    Starred Repositories
                </UnderlineNav.Item>
            </UnderlineNav>

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    setCurrentUser(null);
                    window.location.href = "/auth";
                }}
                style={{ position: "fixed", bottom: "50px", right: "50px" }}
                id="logout"
            >
                Logout
            </button>

            <div className="profile-page-wrapper">
                {/* Left - User Info */}
                <div className="user-profile-section">
                    <div className="profile-image"></div>
                    <div className="name">
                        <h3>{userDetails.username}</h3>
                    </div>
                    {!isOwnProfile && (
                        <button className="follow-btn" onClick={handleFollow}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}


                    <div className="follower">
                        <p>{followerCount} Followers</p>
                        {isOwnProfile ? (
                            <p
                                style={{ cursor: "pointer", color: "#58a6ff" }}
                                onClick={() => {
                                    setShowFollowing(true);
                                    fetchFollowingUsers();
                                }}
                            >
                                {userDetails.followedUsers?.length || 0} Following
                            </p>
                        ) : (
                            <p>{userDetails.followedUsers?.length || 0} Following</p>
                        )}
                    </div>

                </div>

                {/* Right - Tab Content */}
                <div className="heat-map-section">

                    {/* Overview Tab */}
                    {activeTab === "overview" && <HeatMapProfile userId={profileUserId} />}

                    {/* My Repositories Tab */}
                    {activeTab === "repositories" && (
                        <div>
                            <h3 style={{ color: "white", marginBottom: "1rem" }}>
                                {isOwnProfile ? "My Repositories" : `${userDetails.username}'s Repositories`}
                            </h3>
                            {userRepos.length === 0 ? (
                                <p style={{ color: "#8b949e" }}>No repositories yet.</p>
                            ) : (
                                userRepos.map((repo) => (
                                    <div
                                        key={repo._id}
                                        onClick={() => navigate(`/repo/${repo._id}`)}
                                        style={{
                                            padding: "16px",
                                            marginBottom: "12px",
                                            border: "1px solid #30363d",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            backgroundColor: "#0d1117",
                                            color: "#c9d1d9",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = "#58a6ff"}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
                                    >
                                        <h4 style={{ color: "#58a6ff", margin: "0 0 6px 0" }}>{repo.name}</h4>
                                        <p style={{ color: "#8b949e", margin: "0 0 6px 0", fontSize: "14px" }}>
                                            {repo.description}
                                        </p>
                                        <small style={{ color: "#8b949e" }}>
                                            {repo.visibility ? "🔓 Public" : "🔒 Private"}
                                        </small>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Starred Tab - placeholder for now */}
                    {activeTab === "starred" && (
                        <p style={{ color: "#8b949e" }}>Starred repositories coming soon.</p>
                    )}
                </div>
            </div>


            {/* Following Modal — only owner */}
            {showFollowing && isOwnProfile && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100vw", height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: "#161b22",
                        border: "1px solid #30363d",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        width: "400px",
                        maxHeight: "500px",
                        overflowY: "auto",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem"
                        }}>
                            <h3 style={{ color: "white", margin: 0 }}>Following</h3>
                            <button
                                onClick={() => setShowFollowing(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#8b949e",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                }}
                            >✕</button>
                        </div>

                        {/* Loading */}
                        {followingLoading && (
                            <p style={{ color: "#8b949e" }}>Loading...</p>
                        )}

                        {/* Empty state */}
                        {!followingLoading && followingUsers.length === 0 && (
                            <p style={{ color: "#8b949e" }}>You're not following anyone yet.</p>
                        )}

                        {/* Following list */}
                        {!followingLoading && followingUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => {
                                    setShowFollowing(false);
                                    navigate(`/profile/${user._id}`);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    marginBottom: "8px",
                                    transition: "0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0d1117"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: "36px", height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: "#238636",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    color: "white",
                                    fontSize: "14px",
                                    flexShrink: 0,
                                }}>
                                    {user.username?.[0]?.toUpperCase()}
                                </div>

                                {/* Username */}
                                <span style={{ color: "#58a6ff", fontSize: "14px" }}>
                                    {user.username}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
        </>
    );
};

export default Profile;