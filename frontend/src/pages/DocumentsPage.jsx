import { useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  getDocuments,
  uploadDocument,
} from "../api/documents";

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${
    units[index]
  }`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function DocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError(null);

      const data = await getDocuments();

      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (location.state?.deletedDocumentName) {
      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        document.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  function openUploadModal() {
    setUploadError(null);
    setSelectedFile(null);
    setIsUploadOpen(true);
  }

  function closeUploadModal() {
    if (uploading) {
      return;
    }

    setIsUploadOpen(false);
    setSelectedFile(null);
    setUploadError(null);
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileSelection(file) {
    setUploadError(null);

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF documents are supported.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Document size must not exceed 10 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  function handleInputChange(event) {
    handleFileSelection(event.target.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFileSelection(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError("Please select a PDF document.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const uploadedDocument =
        await uploadDocument(selectedFile);

      setDocuments((currentDocuments) => [
        uploadedDocument,
        ...currentDocuments,
      ]);

      closeUploadModal();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="documents-page">
      {location.state?.deletedDocumentName && (
        <div className="document-success-banner">
          <span className="success-banner-icon">✓</span>

          <div>
            <strong>Document deleted</strong>

            <span>
              {location.state.deletedDocumentName} was removed
              successfully.
            </span>
          </div>
        </div>
      )}

      <section className="page-header">
        <div>
          <p className="eyebrow">Knowledge Base</p>

          <h1>Documents</h1>

          <p className="page-description">
            Manage the engineering knowledge available to your
            copilot.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openUploadModal}
        >
          <span>+</span>
          Upload document
        </button>
      </section>

      <section className="documents-card">
        <div className="documents-toolbar">
          <div className="documents-filter-group">
            <div className="search-wrapper">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search documents"
              />

              {search && (
                <button
                  type="button"
                  className="search-clear-button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="status-filter-wrapper">
              <label
                htmlFor="document-status-filter"
                className="filter-label"
              >
                Status
              </label>

              <select
                id="document-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="status-filter"
              >
                <option value="ALL">All statuses</option>
                <option value="READY">Ready</option>
                <option value="PROCESSING">
                  Processing
                </option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          <span className="document-count">
            {filteredDocuments.length}
            {filteredDocuments.length !== documents.length &&
              ` of ${documents.length}`}{" "}
            {filteredDocuments.length === 1
              ? "document"
              : "documents"}
          </span>
        </div>

        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p>Loading documents...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-container error-state">
            <div className="state-icon">!</div>

            <h2>Unable to load documents</h2>

            <p>{error}</p>

            <button
              className="secondary-button"
              type="button"
              onClick={loadDocuments}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          documents.length === 0 && (
            <div className="state-container">
              <div className="empty-document-icon">
                <span>+</span>
              </div>

              <h2>No documents yet</h2>

              <p>
                Upload your first engineering document to
                start building your knowledge base.
              </p>

              <button
                className="secondary-button"
                type="button"
                onClick={openUploadModal}
              >
                Upload document
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          documents.length > 0 &&
          filteredDocuments.length === 0 && (
            <div className="state-container">
              <div className="state-icon">⌕</div>

              <h2>No matching documents</h2>

              <p>
                No documents match your current search and
                filter.
              </p>

              <button
                className="secondary-button"
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredDocuments.length > 0 && (
            <div className="table-wrapper">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document.id}
                      className="document-row"
                      onClick={() =>
                        navigate(`/documents/${document.id}`)
                      }
                    >
                      <td>
                        <div className="document-name">
                          <div className="file-icon">
                            PDF
                          </div>

                          <div>
                            <span className="document-title">
                              {document.name}
                            </span>

                            <span className="document-id">
                              ID #{document.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{document.contentType}</td>

                      <td>
                        {formatFileSize(document.size)}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${document.status.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {document.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(document.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>

      {isUploadOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={closeUploadModal}
        >
          <div
            className="upload-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Knowledge Base</p>
                <h2>Upload document</h2>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={closeUploadModal}
                disabled={uploading}
                aria-label="Close upload dialog"
              >
                ×
              </button>
            </div>

            <div
              className={`drop-zone ${
                dragActive ? "drop-zone-active" : ""
              } ${
                selectedFile ? "drop-zone-selected" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleInputChange}
                hidden
              />

              {selectedFile ? (
                <>
                  <div className="selected-file-icon">
                    PDF
                  </div>

                  <div className="selected-file-info">
                    <strong>{selectedFile.name}</strong>

                    <span>
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>

                  <button
                    className="change-file-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                  >
                    Change
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-icon">
                    ↑
                  </div>

                  <h3>Drop your PDF here</h3>

                  <p>
                    or{" "}
                    <span>
                      browse from your computer
                    </span>
                  </p>

                  <small>
                    PDF files up to 10 MB
                  </small>
                </>
              )}
            </div>

            {uploadError && (
              <div className="upload-error">
                <span>!</span>
                <p>{uploadError}</p>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={closeUploadModal}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <span className="button-spinner" />
                    Uploading...
                  </>
                ) : (
                  "Upload document"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DocumentsPage;