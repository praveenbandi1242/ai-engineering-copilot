import { useEffect, useState } from "react";
import { getHealth } from "./api/health";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await getHealth();
        setHealth(data);
      } catch (err) {
        setError(err.message);
      }
    }

    checkBackend();
  }, []);

  return (
    <div>
      <h1>AI Engineering Knowledge Copilot</h1>

      {health && (
        <div>
          <p>
            <strong>Backend:</strong> {health.status}
          </p>

          <p>
            <strong>Service:</strong> {health.service}
          </p>
        </div>
      )}

      {error && (
        <p>
          <strong>Backend:</strong> DOWN
        </p>
      )}

      {!health && !error && <p>Checking backend...</p>}
    </div>
  );
}

export default App;