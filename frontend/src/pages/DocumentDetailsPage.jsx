import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteDocument,
  getDocumentById,
} from "../api/documents";

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MetadataItem({ label, value, wide = false }) {
  return (
    <div
      className={`metadata-item ${
        wide ? "metadata-item-wide" : ""
      }`}
    >
      <span className="metadata-label">{label}</span>
      <strong title={value}>{value}</strong>
    </div>
  );
}

export default function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      try {
        setLoading(true);
        setError("");

        const data = await getDocumentById(id);

        if (!cancelled) {
          setDocument(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load document"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    try {
      setDeleting(true);
      setDeleteError("");

      await deleteDocument(document.id);

      navigate("/documents", {
        state: {
          deletedDocumentName: document.name,
        },
      });
    } catch (err) {
      setDeleteError(
        err.message || "Unable to delete document"
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="document-details-page">
        <Link
          to="/documents"
          className="details-back-link"
        >
          <span>←</span>
          Documents
        </Link>

        <div className="details-state-card">
          <div className="details-loading-icon">
            <div className="spinner" />
          </div>

          <h2>Loading document</h2>
          <p>Retrieving document information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-details-page">
        <Link
          to="/documents"
          className="details-back-link"
        >
          <span>←</span>
          Documents
        </Link>

        <div className="details-state-card details-error-state">
          <div className="details-error-icon">!</div>

          <h2>Unable to load document</h2>

          <p>{error}</p>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/documents")}
          >
            Back to documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-details-page">
      <div className="details-topbar">
        <Link
          to="/documents"
          className="details-back-link"
        >
          <span>←</span>
          Documents
        </Link>

        <span className="details-location">
          Knowledge Base / Document
        </span>
      </div>

      <section className="document-hero">
        <div className="document-hero-main">
          <div className="document-hero-icon">
            <span>PDF</span>
          </div>

          <div className="document-hero-content">
            <div className="document-hero-label">
              Knowledge source
            </div>

            <h1 title={document.name}>
              {document.name}
            </h1>

            <div className="document-hero-meta">
              <span>
                Document #{document.id}
              </span>

              <span className="meta-separator">
                •
              </span>

              <span>
                {formatFileSize(document.size)}
              </span>

              <span className="meta-separator">
                •
              </span>

              <span>
                Added {formatDate(document.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="document-hero-actions">
          <span className="status-badge status-ready">
            <span className="status-dot" />
            {document.status}
          </span>

          <button
            type="button"
            className="delete-document-button"
            onClick={() => {
              setDeleteError("");
              setDeleteOpen(true);
            }}
          >
            <span>⌫</span>
            Delete
          </button>
        </div>
      </section>

      <div className="details-layout">
        <section className="details-card information-card">
          <div className="details-card-header">
            <div>
              <span className="details-section-label">
                Overview
              </span>

              <h2>Document information</h2>

              <p>
                Metadata and properties associated with
                this knowledge source.
              </p>
            </div>
          </div>

          <div className="metadata-grid">
            <MetadataItem
              label="Document name"
              value={document.name}
              wide
            />

            <MetadataItem
              label="Document ID"
              value={`#${document.id}`}
            />

            <MetadataItem
              label="File size"
              value={formatFileSize(document.size)}
            />

            <MetadataItem
              label="Content type"
              value={document.contentType}
            />

            <MetadataItem
              label="Status"
              value={document.status}
            />

            <MetadataItem
              label="Created"
              value={formatDate(document.createdAt)}
            />

            <MetadataItem
              label="Last updated"
              value={formatDate(document.updatedAt)}
            />
          </div>
        </section>

        <aside className="details-side-column">
          <section className="details-card processing-card">
            <div className="details-card-header">
              <div>
                <span className="details-section-label">
                  Pipeline
                </span>

                <h2>Processing status</h2>
              </div>
            </div>

            <div className="processing-content">
              <div className="processing-step">
                <div className="processing-step-icon processing-complete">
                  ✓
                </div>

                <div className="processing-step-content">
                  <strong>Document ready</strong>

                  <p>
                    This document is available in the
                    knowledge base.
                  </p>
                </div>
              </div>

              <div className="processing-line" />

              <div className="processing-next-step">
                <div className="processing-next-dot" />

                <div>
                  <span>Current state</span>

                  <strong>
                    Ready for processing
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="details-card source-card">
            <div className="source-card-icon">
              PDF
            </div>

            <div className="source-card-content">
              <span>Knowledge source</span>

              <strong>{document.name}</strong>

              <p>
                Uploaded{" "}
                {formatDate(document.createdAt)}
              </p>
            </div>
          </section>
        </aside>
      </div>

      {deleteOpen && (
        <div
          className="delete-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setDeleteOpen(false);
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
          >
            <div className="delete-modal-icon">
              !
            </div>

            <div className="delete-modal-content">
              <span className="details-section-label">
                Destructive action
              </span>

              <h2 id="delete-document-title">
                Delete document?
              </h2>

              <p>
                This will permanently remove{" "}
                <strong>{document.name}</strong>{" "}
                from the knowledge base.
              </p>

              <p className="delete-modal-warning">
                The uploaded file and its document record
                will be deleted.
              </p>
            </div>

            {deleteError && (
              <div className="delete-modal-error">
                {deleteError}
              </div>
            )}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <>
                    <span className="button-spinner" />
                    Deleting...
                  </>
                ) : (
                  "Delete document"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}