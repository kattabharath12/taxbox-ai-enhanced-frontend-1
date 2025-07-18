import React, { useState, useEffect } from 'react';
import axios from 'axios';

const W2Dashboard = () => {
  const [w2Forms, setW2Forms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedW2, setSelectedW2] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchW2Forms();
  }, []);

  const fetchW2Forms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/w2-forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setW2Forms(response.data);
    } catch (error) {
      console.error('Error fetching W2 forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalIncome = () => {
    return w2Forms.reduce((total, w2) => total + (w2.wages_tips_compensation || 0), 0);
  };

  const calculateTotalWithholdings = () => {
    return w2Forms.reduce((total, w2) => total + (w2.federal_income_tax_withheld || 0), 0);
  };

  const createTaxReturn = async () => {
    try {
      const totalIncome = calculateTotalIncome();
      const totalWithholdings = calculateTotalWithholdings();

      const token = localStorage.getItem('token');
      await axios.post('/tax-returns', {
        tax_year: new Date().getFullYear() - 1,
        income: totalIncome,
        withholdings: totalWithholdings
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Tax return created successfully!');
      // Redirect to tax return page or update UI
    } catch (error) {
      console.error('Error creating tax return:', error);
      alert('Error creating tax return');
    }
  };

  const W2DetailModal = () => {
    if (!showModal || !selectedW2) return null;

    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">W2 Form Details - {selectedW2.employer_name}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Employer Information</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Company Name:</strong> {selectedW2.employer_name || 'Not available'}</p>
                      <p><strong>EIN:</strong> {selectedW2.employer_ein || 'Not available'}</p>
                      <p><strong>Address:</strong> {selectedW2.employer_address || 'Not available'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Employee Information</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Name:</strong> {selectedW2.employee_name || 'Not available'}</p>
                      <p><strong>SSN:</strong> {selectedW2.employee_ssn || 'Not available'}</p>
                      <p><strong>Tax Year:</strong> {selectedW2.tax_year || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Tax Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-primary">${(selectedW2.wages_tips_compensation || 0).toFixed(2)}</h4>
                            <small className="text-muted">Wages, Tips, Compensation (Box 1)</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-success">${(selectedW2.federal_income_tax_withheld || 0).toFixed(2)}</h4>
                            <small className="text-muted">Federal Income Tax Withheld (Box 2)</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-info">${(selectedW2.social_security_wages || 0).toFixed(2)}</h4>
                            <small className="text-muted">Social Security Wages (Box 3)</small>
                          </div>
                        </div>
                      </div>

                      <div className="row mt-3">
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-warning">${(selectedW2.social_security_tax_withheld || 0).toFixed(2)}</h4>
                            <small className="text-muted">Social Security Tax Withheld (Box 4)</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-secondary">${(selectedW2.medicare_wages || 0).toFixed(2)}</h4>
                            <small className="text-muted">Medicare Wages (Box 5)</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 border rounded">
                            <h4 className="text-dark">${(selectedW2.medicare_tax_withheld || 0).toFixed(2)}</h4>
                            <small className="text-muted">Medicare Tax Withheld (Box 6)</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Processing Information</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Confidence Score:</strong> {((selectedW2.confidence_score || 0) * 100).toFixed(1)}%</p>
                      <p><strong>Processed On:</strong> {new Date(selectedW2.created_at).toLocaleString()}</p>
                      <p><strong>Last Updated:</strong> {new Date(selectedW2.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">W2 Forms Dashboard</h1>
        </div>
      </div>

      {w2Forms.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-file-alt fa-4x text-muted mb-3"></i>
                <h4>No W2 Forms Found</h4>
                <p className="text-muted">Upload your W2 documents to get started with automatic data extraction.</p>
                <a href="/documents" className="btn btn-primary">
                  <i className="fas fa-upload"></i> Upload Documents
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{w2Forms.length}</h4>
                      <p className="mb-0">W2 Forms</p>
                    </div>
                    <div>
                      <i className="fas fa-file-alt fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>${calculateTotalIncome().toFixed(2)}</h4>
                      <p className="mb-0">Total Income</p>
                    </div>
                    <div>
                      <i className="fas fa-dollar-sign fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>${calculateTotalWithholdings().toFixed(2)}</h4>
                      <p className="mb-0">Total Withholdings</p>
                    </div>
                    <div>
                      <i className="fas fa-receipt fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <button 
                        className="btn btn-light btn-sm"
                        onClick={createTaxReturn}
                      >
                        Create Tax Return
                      </button>
                      <p className="mb-0 mt-2">Quick Action</p>
                    </div>
                    <div>
                      <i className="fas fa-calculator fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* W2 Forms Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Your W2 Forms</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Employer</th>
                          <th>Tax Year</th>
                          <th>Wages</th>
                          <th>Federal Tax Withheld</th>
                          <th>Confidence</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {w2Forms.map((w2) => (
                          <tr key={w2.id}>
                            <td>
                              <strong>{w2.employer_name || 'Unknown Employer'}</strong>
                              <br />
                              <small className="text-muted">{w2.employer_ein || 'EIN not available'}</small>
                            </td>
                            <td>{w2.tax_year || 'N/A'}</td>
                            <td>${(w2.wages_tips_compensation || 0).toFixed(2)}</td>
                            <td>${(w2.federal_income_tax_withheld || 0).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${
                                (w2.confidence_score || 0) > 0.8 ? 'badge-success' :
                                (w2.confidence_score || 0) > 0.6 ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {((w2.confidence_score || 0) * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setSelectedW2(w2);
                                  setShowModal(true);
                                }}
                              >
                                <i className="fas fa-eye"></i> View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <W2DetailModal />
    </div>
  );
};

export default W2Dashboard;
