"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ApiGenerator } from "@/components/api-generator";

interface Endpoint {
  path: string;
  methods: string[];
}

export function EndpointList() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const response = await fetch("/api/endpoints");
      if (response.ok) {
        const data = await response.json();
        const groupedEndpoints = groupEndpoints(data);
        setEndpoints(groupedEndpoints);
      } else {
        throw new Error("Failed to fetch endpoints");
      }
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    }
  };

  const groupEndpoints = (
    data: { path: string; method: string }[]
  ): Endpoint[] => {
    const groupedMap = new Map<string, string[]>();
    for (const { path, method } of data) {
      if (!groupedMap.has(path)) {
        groupedMap.set(path, []);
      }
      groupedMap.get(path)!.push(method);
    }
    return Array.from(groupedMap.entries()).map(([path, methods]) => ({
      path,
      methods,
    }));
  };

  const handleEdit = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
  };

  const handleDelete = async (endpoint: Endpoint) => {
    try {
      const response = await fetch("/api/delete-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(endpoint),
      });

      if (response.ok) {
        fetchEndpoints();
      } else {
        throw new Error("Failed to delete endpoint");
      }
    } catch (error) {
      console.error("Error deleting endpoint:", error);
    }
  };

  return (
    <div>
      {editingEndpoint ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">Edit Endpoint</h3>
          <ApiGenerator
            initialEndpoint={editingEndpoint.path}
            initialMethods={editingEndpoint.methods}
            onSave={() => {
              setEditingEndpoint(null);
              fetchEndpoints();
            }}
          />
          <Button
            variant="outline"
            onClick={() => setEditingEndpoint(null)}
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {endpoints.map((endpoint) => (
            <li
              key={endpoint.path}
              className="flex items-center justify-between bg-secondary p-2 rounded"
            >
              <span>
                <span className="font-semibold">
                  {endpoint.methods.join(", ")}
                </span>{" "}
                {endpoint.path}
              </span>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(endpoint)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(endpoint)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
