"use client";
import { useEffect, useState } from "react";

export default function DegreeProgress({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/degree-progress/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading) return <p className="text-gray-500 text-sm">Loading progress...</p>;
  if (error) return <p className="text-red-500 text-sm">Error: {error}</p>;
  if (!data) return <p className="text-gray-500 text-sm">No progress data available</p>;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="font-semibold mb-3 text-black">Degree Progress</h2>
      <p className="text-sm mb-2 text-black">
        {data.completedCredits} / {data.totalCredits} credits
      </p>
      <div className="w-full bg-gray-200 rounded h-4">
        <div
          className="bg-blue-500 h-4 rounded"
          style={{ width: `${Math.round(data.percentage)}%` }}
        />
      </div>
      <p className="text-sm mt-2 text-black">{Math.round(data.percentage)}% completed</p>
    </div>
  );
}