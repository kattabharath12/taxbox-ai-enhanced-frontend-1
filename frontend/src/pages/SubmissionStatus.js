import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmissionStatus = () => {
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxReturns();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const response = await axios.get('/tax-returns');
      setTaxReturns(response.data);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { class: 'bg-warning', text: 'Draft' },
      'submitted': { class: 'bg-info', text: 'Submitted' },
      'processed': { class: 'bg-success', text: 'Processed' },
      'rejected': { class: 'bg-danger', text: 'Rejected' }
    };

    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Submission Status</h1>

      {taxReturns.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <h5>No Tax Returns Found</h5>
            <p>You haven't created any tax returns yet.</p>
            <a href="/tax-wizard" className="btn btn-primary">
              Create Your First Tax Return
            </a>
          </div>
        </div>
      ) : (
        <div className="row">
          {taxReturns.map((taxReturn) => (
            <div key={taxReturn.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Tax Year {taxReturn.tax_year}</h6>
                  {getStatusBadge(taxReturn.status)}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Income</small>
                      <p className="mb-2">${taxReturn.income.toLocaleString()}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Tax Owed</small>
                      <p className="mb-2">${taxReturn.tax_owed.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Withholdings</small>
                      <p className="mb-2">${taxReturn.withholdings.toLocaleString()}</p>
                    </div>
                    <div className="col-6">
                      {taxReturn.refund_amount > 0 ? (
                        <>
                          <small className="text-muted">Refund</small>
                          <p className="mb-2 text-success">${taxReturn.refund_amount.toFixed(2)}</p>
                        </>
                      ) : (
                        <>
                          <small className="text-muted">Amount Owed</small>
                          <p className="mb-2 text-danger">${taxReturn.amount_owed.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">Created: {new Date(taxReturn.created_at).toLocaleDateString()}</small>
                    {taxReturn.submitted_at && (
                      <br />
                      <small className="text-muted">Submitted: {new Date(taxReturn.submitted_at).toLocaleDateString()}</small>
                    )}
                  </div>

                  {taxReturn.status === 'draft' && (
                    <div className="mt-3">
                      <button className="btn btn-primary btn-sm me-2">
                        Continue Editing
                      </button>
                      <button className="btn btn-success btn-sm">
                        Submit Return
                      </button>
                    </div>
                  )}

                  {taxReturn.amount_owed > 0 && taxReturn.status !== 'draft' && (
                    <div className="mt-3">
                      <a 
                        href={`/payment?tax_return_id=${taxReturn.id}`}
                        className="btn btn-warning btn-sm"
                      >
                        Pay Now
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionStatus;