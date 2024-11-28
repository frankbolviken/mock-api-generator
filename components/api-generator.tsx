"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MonacoEditor } from "@/components/monaco-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ApiGeneratorProps {
  initialEndpoint?: string;
  initialMethods?: string[];
  onSave?: () => void;
}

export function ApiGenerator({
  initialEndpoint = "",
  initialMethods = ["GET"],
  onSave,
}: ApiGeneratorProps) {
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const [selectedMethod, setSelectedMethod] = useState(initialMethods[0]);
  const [availableMethods, setAvailableMethods] =
    useState<string[]>(initialMethods);
  const [mockResponse, setMockResponse] = useState<string | undefined>(
    '{\n  "message": "Hello, World!"\n}'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEndpoint && initialMethods.length > 0) {
      setAvailableMethods(initialMethods);
      setSelectedMethod(initialMethods[0]);
      fetchMockResponse(initialMethods[0]);
    }
  }, [initialEndpoint, initialMethods]);

  const fetchMockResponse = async (method: string) => {
    setError(null);
    try {
      const response = await fetch(
        `/api/mock-response?endpoint=${initialEndpoint}&method=${method}`
      );
      if (response.ok) {
        const data = await response.json();
        setMockResponse(JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error + (errorData.details ? `: ${errorData.details}` : "")
        );
      }
    } catch (error) {
      console.error("Error fetching mock response:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setMockResponse('{\n  "error": "Failed to fetch mock response"\n}');
    }
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    fetchMockResponse(method);
  };

  const handleSave = async () => {
    setError(null);
    try {
      const response = await fetch("/api/save-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          method: selectedMethod,
          mockResponse,
          availableMethods, // Send all available methods to preserve other methods
        }),
      });

      if (response.ok) {
        alert("Mock API saved successfully!");
        if (onSave) {
          onSave();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save mock API");
      }
    } catch (error) {
      console.error("Error saving mock API:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="endpoint">API Endpoint</Label>
        <Input
          id="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="/api/example"
        />
      </div>
      <div>
        <Label>HTTP Method</Label>
        <RadioGroup
          value={selectedMethod}
          onValueChange={handleMethodChange}
          className="flex space-x-4"
        >
          {availableMethods.map((method) => (
            <div key={method} className="flex items-center space-x-2">
              <RadioGroupItem value={method} id={`method-${method}`} />
              <Label htmlFor={`method-${method}`}>{method}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="mock-response">Mock Response</Label>
        <MonacoEditor
          value={mockResponse || ""}
          onChange={setMockResponse}
          language="json"
          height="300px"
        />
      </div>
      <Button onClick={handleSave}>Save Mock API</Button>
    </div>
  );
}
