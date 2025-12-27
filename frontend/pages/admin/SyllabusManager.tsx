import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, FileText, Trash2, Download, Loader, Plus, X, Link as LinkIcon, File, FileImage, Presentation } from 'lucide-react';

interface Attachment {
  type: 'pdf' | 'ppt' | 'image' | 'link';
  name: string;
  url: string;
  cloudinaryId?: string;
  uploadedAt: string;
}

interface Syllabus {
  _id: string;
  title: string;
  contentRaw: string;
  attachments: Attachment[];
  uploadedBy: string;
  createdAt: string;
}

export const SyllabusManager: React.FC = () => {
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', contentRaw: '' });
  const [attachmentData, setAttachmentData] = useState<{ type: 'pdf' | 'ppt' | 'image' | 'link'; name: string; file: File | null; url: string }>({ 
    type: 'pdf', 
    name: '', 
    file: null,
    url: ''
  });

  useEffect(() => {
    if (!user || (user as any).role !== 'admin') {
      return;
    }
    fetchSyllabi();
  }, [user]);

  const fetchSyllabi = async () => {
    try {
      const response = await fetch('http://localhost:4200/syllabus/all');
      if (!response.ok) throw new Error('Failed to fetch syllabi');
      const data = await response.json();
      setSyllabi(data.syllabi || []);
    } catch (err) {
      console.error('Error fetching syllabi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.contentRaw) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);
    try {
      const token = (user as any).token;
      const response = await fetch('http://localhost:4200/syllabus/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          contentRaw: formData.contentRaw,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload syllabus');
      }

      const result = await response.json();
      setSyllabi([result.syllabus, ...syllabi]);
      setFormData({ title: '', contentRaw: '' });
      setShowForm(false);
      alert('Syllabus uploaded successfully!');
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentData.name) {
      alert('Please enter attachment name');
      return;
    }

    if (attachmentData.type === 'link' && !attachmentData.url) {
      alert('Please enter URL for link');
      return;
    }

    if (attachmentData.type !== 'link' && !attachmentData.file) {
      alert('Please select a file');
      return;
    }

    if (!selectedSyllabus) {
      alert('No syllabus selected');
      return;
    }

    setUploading(true);
    try {
      const token = (user as any).token;
      const formDataToSend = new FormData();
      formDataToSend.append('attachmentType', attachmentData.type);
      formDataToSend.append('attachmentName', attachmentData.name);
      
      if (attachmentData.file) {
        console.log('Appending file:', attachmentData.file.name);
        formDataToSend.append('file', attachmentData.file);
      } else if (attachmentData.url) {
        console.log('Appending URL:', attachmentData.url);
        formDataToSend.append('attachmentUrl', attachmentData.url);
      }

      console.log('Sending attachment request to:', `http://localhost:4200/syllabus/add-attachment/${selectedSyllabus}`);

      const response = await fetch(
        `http://localhost:4200/syllabus/add-attachment/${selectedSyllabus}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // DO NOT set Content-Type: FormData handles it automatically
          },
          body: formDataToSend,
        }
      );

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMsg = 'Failed to add attachment';
        try {
          const data = JSON.parse(responseText);
          errorMsg = data.error || data.message || errorMsg;
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = JSON.parse(responseText);
      setSyllabi(
        syllabi.map(s => (s._id === selectedSyllabus ? result.syllabus : s))
      );
      setAttachmentData({ type: 'pdf', name: '', file: null, url: '' });
      setShowAttachmentForm(false);
      alert('Attachment added successfully!');
    } catch (err) {
      console.error('Attachment error:', err);
      alert(`Error: ${(err as any).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (syllabusId: string, attachmentIndex: number) => {
    if (!window.confirm('Delete this attachment?')) return;

    try {
      const token = (user as any).token;
      const response = await fetch(
        `http://localhost:4200/syllabus/delete-attachment/${syllabusId}/${attachmentIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete attachment');
      }

      const result = await response.json();
      setSyllabi(
        syllabi.map(s => (s._id === syllabusId ? result.syllabus : s))
      );
      alert('Attachment deleted!');
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    }
  };

  const handleDelete = async (syllabusId: string) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return;

    try {
      const token = (user as any).token;
      const response = await fetch(`http://localhost:4200/syllabus/delete/${syllabusId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete syllabus');
      }

      setSyllabi(syllabi.filter(s => s._id !== syllabusId));
      alert('Syllabus deleted successfully!');
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <File size={16} className="text-red-500" />;
      case 'ppt':
        return <Presentation size={16} className="text-orange-500" />;
      case 'image':
        return <FileImage size={16} className="text-blue-500" />;
      case 'link':
        return <LinkIcon size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Only admins can manage syllabi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Syllabus Management</h1>
              <p className="text-gray-600 mt-2">Upload and manage course syllabi with attachments</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Upload size={20} />
              Upload Syllabus
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Syllabus</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Data Structures - CSC 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus Content
                </label>
                <textarea
                  value={formData.contentRaw}
                  onChange={(e) => setFormData({ ...formData, contentRaw: e.target.value })}
                  placeholder="Paste syllabus content here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', contentRaw: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Syllabi List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader size={32} className="animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-gray-600">Loading syllabi...</p>
          </div>
        ) : syllabi.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Syllabi Yet</h3>
            <p className="text-gray-600">Upload your first syllabus to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {syllabi.map((syllabus) => (
              <div key={syllabus._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Syllabus Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText size={32} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {syllabus.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Uploaded on {new Date(syllabus.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 line-clamp-2">
                        {syllabus.contentRaw.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(syllabus._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Syllabus"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Attachments Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">
                      Attachments ({syllabus.attachments?.length || 0})
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedSyllabus(syllabus._id);
                        setShowAttachmentForm(!showAttachmentForm && selectedSyllabus === syllabus._id);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus size={16} />
                      Add Attachment
                    </button>
                  </div>

                  {/* Attachment Upload Form */}
                  {showAttachmentForm && selectedSyllabus === syllabus._id && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                      <form onSubmit={handleAddAttachment}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Attachment Type
                            </label>
                            <select
                              value={attachmentData.type}
                              onChange={(e) => setAttachmentData({ ...attachmentData, type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pdf">PDF Document</option>
                              <option value="ppt">PowerPoint</option>
                              <option value="image">Image</option>
                              <option value="link">External Link</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name/Title
                            </label>
                            <input
                              type="text"
                              value={attachmentData.name}
                              onChange={(e) => setAttachmentData({ ...attachmentData, name: e.target.value })}
                              placeholder="e.g., Lecture Slides Chapter 1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {attachmentData.type === 'link' ? (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL
                            </label>
                            <input
                              type="url"
                              value={attachmentData.url}
                              onChange={(e) => setAttachmentData({ ...attachmentData, url: e.target.value })}
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select File
                            </label>
                            <input
                              type="file"
                              onChange={(e) => setAttachmentData({ ...attachmentData, file: e.target.files?.[0] || null })}
                              accept={
                                attachmentData.type === 'pdf' ? '.pdf' :
                                attachmentData.type === 'ppt' ? '.ppt,.pptx' :
                                'image/*'
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            {attachmentData.file && (
                              <p className="text-sm text-green-600 mt-1">
                                ✓ {attachmentData.file.name}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={uploading}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
                          >
                            {uploading ? (
                              <>
                                <Loader size={16} className="animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus size={16} />
                                Add
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentForm(false);
                              setAttachmentData({ type: 'pdf', name: '', file: null, url: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Attachments List */}
                  {syllabus.attachments && syllabus.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {syllabus.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getAttachmentIcon(attachment.type)}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-700 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attachment.type.toUpperCase()} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteAttachment(syllabus._id, idx);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No attachments yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
