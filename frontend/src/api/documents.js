import { apiRequest } from "./client";

export function getDocuments() {
  return apiRequest("/api/documents");
}

export async function getDocumentById(id) {
  return apiRequest(`/api/documents/${id}`);
}

export async function uploadDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Unable to upload document";

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function deleteDocument(id) {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Unable to delete document";

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }
}