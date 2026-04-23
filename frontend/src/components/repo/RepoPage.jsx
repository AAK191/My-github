import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";

const RepoPage = () => {
    const { id } = useParams();
    const [repo, setRepo] = useState(null);

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

    if (!repo) return <><Navbar /><p>Loading...</p></>;

    return (
        <>
            <Navbar />
            <div style={{ padding: "2rem" }}>
                <h1>{repo.name}</h1>
                <p>{repo.description}</p>
                <small>{repo.visibility ? "🔓 Public" : "🔒 Private"}</small>
            </div>
        </>
    );
};

export default RepoPage;