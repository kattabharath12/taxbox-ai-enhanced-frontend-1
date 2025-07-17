import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [w2Data, setW2Data] = useState(null);
  const [showW2Modal, setShowW2Modal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (files) => {
    setUploading(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        await axios.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading ${file.name}: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }

    setUploading(false);
    fetchDocuments();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const fetchW2Data = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/documents/${documentId}/w2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setW2Data(response.data);
      setShowW2Modal(true);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('No W2 data found for this document or processing is still in progress.');
      } else {
        console.error('Error fetching W2 data:', error);
        alert('Error fetching W2 data');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Processing Pending' },
      processing: { class: 'badge-info', text: 'Processing...' },
      completed: { class: 'badge-success', text: 'W2 Detected' },
      no_w2_detected: { class: 'badge-secondary', text: 'No W2 Detected' },
      failed: { class: 'badge-danger', text: 'Processing Failed' }
    };

    const config = statusConfig[status] || { class: 'badge-secondary', text: 'Unknown' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const W2Modal = () => {
    if (!showW2Modal || !w2Data) return null;

    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">W2 Form Data</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowW2Modal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Employer Information</h6>
                  <p><strong>Name:</strong> {w2Data.employer_name || 'Not detected'}</p>
                  <p><strong>EIN:</strong> {w2Data.employer_ein || 'Not detected'}</p>
                  <p><strong>Address:</strong> {w2Data.employer_address || 'Not detected'}</p>
                </div>
                <div className="col-md-6">
                  <h6>Employee Information</h6>
                  <p><strong>Name:</strong> {w2Data.employee_name || 'Not detected'}</p>
                  <p><strong>SSN:</strong> {w2Data.employee_ssn || 'Not detected'}</p>
                </div>
              </div>

              <hr />

              <h6>Tax Information</h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Wages (Box 1):</strong> ${w2Data.wages_tips_compensation?.toFixed(2) || '0.00'}</p>
                  <p><strong>Federal Tax Withheld (Box 2):</strong> ${w2Data.federal_income_tax_withheld?.toFixed(2) || '0.00'}</p>
                  <p><strong>Social Security Wages (Box 3):</strong> ${w2Data.social_security_wages?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Social Security Tax (Box 4):</strong> ${w2Data.social_security_tax_withheld?.toFixed(2) || '0.00'}</p>
                  <p><strong>Medicare Wages (Box 5):</strong> ${w2Data.medicare_wages?.toFixed(2) || '0.00'}</p>
                  <p><strong>Medicare Tax (Box 6):</strong> ${w2Data.medicare_tax_withheld?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <p><strong>Tax Year:</strong> {w2Data.tax_year || 'Not detected'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Confidence Score:</strong> {(w2Data.confidence_score * 100)?.toFixed(1) || '0'}%</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowW2Modal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement auto-fill tax return functionality
                  alert('Auto-fill tax return feature coming soon!');
                }}
              >
                Auto-fill Tax Return
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Document Upload & W2 Processing</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Upload Documents</h5>
              <p className="text-muted">
                Upload your tax documents (W2, 1099, receipts, etc.). W2 forms will be automatically processed.
              </p>

              <div
                className={`border-2 border-dashed rounded p-4 text-center ${
                  dragActive ? 'border-primary bg-light' : 'border-secondary'
                } ${uploading ? 'opacity-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div>
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                    <p>Processing your documents...</p>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                    <p className="mb-3">
                      Drag and drop your files here, or{' '}
                      <label className="text-primary" style={{ cursor: 'pointer' }}>
                        browse
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </p>
                    <small className="text-muted">
                      Supported formats: PDF, JPG, PNG, TIFF, BMP (Max 10MB each)
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Processing Status</h5>
              <div className="d-flex justify-content-between">
                <small>Total Documents:</small>
                <span className="badge badge-primary">{documents.length}</span>
              </div>
              <div className="d-flex justify-content-between">
                <small>W2 Forms Detected:</small>
                <span className="badge badge-success">
                  {documents.filter(doc => doc.extraction_status === 'completed').length}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <small>Processing:</small>
                <span className="badge badge-info">
                  {documents.filter(doc => ['pending', 'processing'].includes(doc.extraction_status)).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Uploaded Documents</h5>

              {documents.length === 0 ? (
                <p className="text-muted">No documents uploaded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Type</th>
                        <th>Upload Date</th>
                        <th>Processing Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.filename}</td>
                          <td>
                            <span className="badge badge-secondary">
                              {doc.file_type.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                          <td>{getStatusBadge(doc.extraction_status)}</td>
                          <td>
                            {doc.extraction_status === 'completed' && (
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => fetchW2Data(doc.id)}
                              >
                                <i className="fas fa-eye"></i> View W2 Data
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => window.open(`/uploads/${doc.file_path.split('/').pop()}`, '_blank')}
                            >
                              <i className="fas fa-download"></i> Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <W2Modal />
    </div>
  );
};

export default DocumentUpload;
