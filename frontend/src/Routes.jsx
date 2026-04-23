import React, { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';

//Pages list

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import RepoPage from './components/repo/RepoPage';
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        const userIdFromstorage = localStorage.getItem("userId");

        if (!userIdFromstorage && !currentUser) {
            setCurrentUser(userIdFromstorage);
        }

        if (!userIdFromstorage && !["/auth", "/signup"].includes(window.location.pathname)) {
            navigate("/auth");
        }

        if (userIdFromstorage && window.location.pathname == '/auth') {
            navigate("/");
        }

    }, [currentUser, navigate, setCurrentUser, isLoading]);

    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />
        },
        {
            path: "/auth",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path:"/profile/:userId",
             element: <Profile />
        },
        { 
            path: "/repo/:id", 
            element: <RepoPage /> 
        }

    ]);

    return element;
}

export default ProjectRoutes;