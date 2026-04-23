import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({ username: "username" });
    const { setCurrentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);

     const loggedInUserId = localStorage.getItem("userId");
    const profileUserId = userId || loggedInUserId;   
    const isOwnProfile = profileUserId === loggedInUserId;

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!profileUserId) return;
            try {
                const response = await axios.get(
                    `http://localhost:3000/user/userProfile/${profileUserId}`
                );
                setUserDetails(response.data);
                setFollowerCount(response.data.followers?.length || 0);

                // Check if logged-in user already follows this profile
                const alreadyFollowing = response.data.followers?.includes(loggedInUserId);
                setIsFollowing(alreadyFollowing);
            } catch (err) {
                console.error("Cannot fetch user details: ", err);
            }
        };
        fetchUserDetails();
    }, [profileUserId]);

    const handleFollow = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/user/userProfile/${profileUserId}/follow`, 
            { currentUserId: loggedInUserId },
            
        );

            setIsFollowing(response.data.following);
            setFollowerCount(prev => response.data.following ? prev + 1 : prev - 1);
        } catch (err) {
            console.error("Follow action failed: ", err);
        }
    };


    return (
        <>
            <Navbar />
            <UnderlineNav aria-label="Repository">
                <UnderlineNav.Item
                    aria-current="page"
                    icon={BookIcon}
                    sx={{
                        backgroundColor: "transparent",
                        color: "white",
                        "&:hover": {
                            textDecoration: "underline",
                            color: "white",
                        },
                    }}
                >
                    Overview
                </UnderlineNav.Item>

                <UnderlineNav.Item
                    onClick={() => navigate("/repo")}
                    icon={RepoIcon}
                    sx={{
                        backgroundColor: "transparent",
                        color: "whitesmoke",
                        "&:hover": {
                            textDecoration: "underline",
                            color: "white",
                        },
                    }}
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
                <div className="user-profile-section">
                    <div className="profile-image"></div>

                    <div className="name">
                        <h3>{userDetails.username}</h3>
                    </div>

                    <button className="follow-btn" onClick={handleFollow}>
                        {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                    
                    <div className="follower">
                        <p>10 Follower</p>
                        <p>3 Following</p>
                    </div>
                </div>

                <div className="heat-map-section">
                    <HeatMapProfile />
                </div>
            </div>
        </>
    );
};

export default Profile;