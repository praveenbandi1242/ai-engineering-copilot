import { useEffect, useState } from "react";
import { getHealth } from "../api/health";

function HealthStatus() {
  const [status, setStatus] = useState("checking");
  const [service, setService] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkHealth() {
      try {
        setStatus("checking");
        setError("");

        const data = await getHealth();

        setStatus(data.status);
        setService(data.service);
      } catch (err) {
        setStatus("DOWN");
        setError(err.message);
      }
    }

    checkHealth();
  }, []);

  if (status === "checking") {
    return <div>Checking backend...</div>;
  }

  if (status === "DOWN") {
    return <div>Backend unavailable: {error}</div>;
  }

  return (
    <div>
      <strong>Backend:</strong> {status}
      <br />
      <strong>Service:</strong> {service}
    </div>
  );
}

export default HealthStatus;