import { ApiGenerator } from "@/components/api-generator";
import { EndpointList } from "@/components/endpoint-list";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Mock API Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create New Endpoint</h2>
          <ApiGenerator />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Existing Endpoints</h2>
          <EndpointList />
        </div>
      </div>
    </main>
  );
}
