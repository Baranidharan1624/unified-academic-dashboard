import { useState } from 'react';
import FileDropZone from '../../components/ui/FileDropZone';
import { bulkImportService } from '../../services/bulkImportService';
import './BulkUserImportPage.css';

function BulkUserImportPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError('');
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await bulkImportService.importUsers(selectedFile, userType);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
  };

  const downloadTemplate = (type) => {
    const headers = type === 'student' 
      ? ['Name', 'Email', 'Department', 'Program', 'Semester']
      : ['Name', 'Email', 'Department', 'Designation'];
    
    const exampleData = type === 'student'
      ? ['John Doe', 'john@example.com', 'Computer Science', 'B.Tech', '3']
      : ['Dr. Kumar', 'kumar@example.com', 'Computer Science', 'Professor'];
    
    const csvContent = [
      headers.join(','),
      exampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bulk-import-page">
      <div className="page-header">
        <h1>Bulk User Import</h1>
        <p>Upload an Excel file to create multiple user accounts at once</p>
      </div>

      <div className="import-card">
        <div className="import-options">
          <div className="user-type-selector">
            <label>User Type</label>
            <div className="type-buttons">
              <button
                className={`type-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => { setUserType('student'); handleReset(); }}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Students
              </button>
              <button
                className={`type-btn ${userType === 'faculty' ? 'active' : ''}`}
                onClick={() => { setUserType('faculty'); handleReset(); }}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Faculty
              </button>
            </div>
          </div>

          <div className="template-download">
            <span>Download Template:</span>
            <button onClick={() => downloadTemplate(userType)} disabled={loading}>
              {userType === 'student' ? 'Student Template' : 'Faculty Template'}
            </button>
          </div>
        </div>

        <div className="file-upload-section">
          <label>Upload File</label>
          <FileDropZone 
            onFileSelect={handleFileSelect} 
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn-primary" 
            onClick={handleImport}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Importing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import Users
              </>
            )}
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        {result && (
          <div className="import-result">
            <div className="result-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3>Import Complete</h3>
            </div>

            <div className="result-stats">
              <div className="stat-item total">
                <span className="stat-value">{result.totalRecords}</span>
                <span className="stat-label">Total Records</span>
              </div>
              <div className="stat-item success">
                <span className="stat-value">{result.successfulImports}</span>
                <span className="stat-label">Successful</span>
              </div>
              <div className="stat-item failed">
                <span className="stat-value">{result.failedRecords}</span>
                <span className="stat-label">Failed</span>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="error-details">
                <h4>Failed Records</h4>
                <div className="error-table">
                  <div className="error-table-header">
                    <span>Row</span>
                    <span>Email</span>
                    <span>Error</span>
                  </div>
                  {result.errors.map((err, index) => (
                    <div key={index} className="error-table-row">
                      <span>{err.row}</span>
                      <span>{err.email || '-'}</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="format-info">
        <h3>Expected Format</h3>
        <div className="format-table">
          {userType === 'student' ? (
            <>
              <div className="format-header">
                <span>Column</span>
                <span>Description</span>
                <span>Example</span>
              </div>
              <div className="format-row">
                <span>A</span>
                <span>Name (Required)</span>
                <span>John Doe</span>
              </div>
              <div className="format-row">
                <span>B</span>
                <span>Email (Required)</span>
                <span>john@example.com</span>
              </div>
              <div className="format-row">
                <span>C</span>
                <span>Department</span>
                <span>Computer Science</span>
              </div>
              <div className="format-row">
                <span>D</span>
                <span>Program</span>
                <span>B.Tech</span>
              </div>
              <div className="format-row">
                <span>E</span>
                <span>Semester</span>
                <span>3</span>
              </div>
            </>
          ) : (
            <>
              <div className="format-header">
                <span>Column</span>
                <span>Description</span>
                <span>Example</span>
              </div>
              <div className="format-row">
                <span>A</span>
                <span>Name (Required)</span>
                <span>Dr. Kumar</span>
              </div>
              <div className="format-row">
                <span>B</span>
                <span>Email (Required)</span>
                <span>kumar@example.com</span>
              </div>
              <div className="format-row">
                <span>C</span>
                <span>Department</span>
                <span>Computer Science</span>
              </div>
              <div className="format-row">
                <span>D</span>
                <span>Designation</span>
                <span>Professor</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkUserImportPage;

