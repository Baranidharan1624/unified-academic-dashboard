
import { useState, useRef } from 'react';
import { fileService } from '../../services/fileService';
import './FileUploader.css';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'application/zip'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function FileUploader({ 
  fileType = 'OTHER', 
  onUploadSuccess, 
  onUploadError,
  multiple = false,
  accept = '.pdf,.docx,.jpg,.jpeg,.png,.zip'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not allowed';
    }
    return null;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    setError('');
    const files = e.target.files;
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    const filesArray = multiple ? Array.from(files) : [files[0]];
    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (onUploadError) onUploadError(validationError);
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      try {
        const uploadedFile = await fileService.uploadFile(file, fileType, (progress) => setUploadProgress(progress));
        setUploadedFiles(prev => [...prev, uploadedFile]);
        if (onUploadSuccess) onUploadSuccess(uploadedFile);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Upload failed';
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('zip')) return '📦';
    return '📁';
  };

  return (
    <div className="file-uploader">
      <div className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" multiple={multiple} accept={accept} onChange={handleChange} style={{ display: 'none' }} />
        <div className="upload-content">
          <div className="upload-icon">{uploading ? '⏳' : '📤'}</div>
          {uploading ? (
            <div className="upload-progress-container">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          ) : (
            <><p className="upload-text">Drag & drop files here or <span className="browse-link">browse</span></p>
            <p className="upload-hint">Maximum file size: 10MB<br />Allowed: PDF, DOCX, JPG, PNG, ZIP</p></>
          )}
        </div>
      </div>
      {error && <div className="upload-error">⚠️ {error}</div>}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files</h4>
          <div className="file-list">
            {uploadedFiles.map((file, index) => (
              <div key={file.id || index} className="file-item">
                <span className="file-icon">{getFileIcon(file.fileType)}</span>
                <div className="file-info">
                  <span className="file-name">{file.originalFileName}</span>
                  <span className="file-size">{fileService.formatFileSize(file.fileSize)}</span>
                </div>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;

