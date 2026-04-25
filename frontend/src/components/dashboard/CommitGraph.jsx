import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const CommitGraph = ({ repoId }) => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (!repoId) return;

    fetch(`http://localhost:3000/commit/repo/${repoId}`)
      .then((res) => res.json())
      .then((commits) => {
        // Group commits by date
        const grouped = {};
        commits.forEach((commit) => {
          const date = new Date(commit.created_at).toLocaleDateString("en-US", {
            month: "short", day: "numeric"
          });
          grouped[date] = (grouped[date] || 0) + 1;
        });

        // Convert to array for Recharts
        const formatted = Object.entries(grouped).map(([date, count]) => ({
          date,
          commits: count,
        }));

        setGraphData(formatted);
      })
      .catch((err) => console.error("Failed to fetch commits:", err));
  }, [repoId]);

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h3>Commit Activity</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="commits" fill="#238636" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitGraph;