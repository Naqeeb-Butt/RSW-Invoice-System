import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/v1/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/v1/clients/${clientId}`);
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client. They may have associated invoices.');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aasko-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client information</p>
          </div>
          <Link
            to="/clients/new"
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-aasko-blue p-2 rounded-md mr-3">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">Client</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Link
                  to={`/clients/${client.id}/edit`}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {client.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {client.phone}
                </div>
              )}
              {client.address && (
                <div className="text-gray-600">
                  <span className="text-gray-400">Address:</span> {client.address}
                </div>
              )}
              {client.ntn && (
                <div className="text-gray-600">
                  <span className="text-gray-400">NTN:</span> {client.ntn}
                </div>
              )}
              {client.gst && (
                <div className="text-gray-600">
                  <span className="text-gray-400">GST:</span> {client.gst}
                </div>
              )}
              {client.vendor_code && (
                <div className="text-gray-600">
                  <span className="text-gray-400">Vendor Code:</span> {client.vendor_code}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to={`/invoices?client=${client.id}`}
                className="text-aasko-blue hover:text-aasko-blue-dark text-sm font-medium"
              >
                View Invoices →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No clients found</p>
          <Link
            to="/clients/new"
            className="btn btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first client
          </Link>
        </div>
      )}
    </div>
  );
}
