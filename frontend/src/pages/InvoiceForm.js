import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Calculator
} from 'lucide-react';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    invoice_number: '',
    po_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    notes: '',
    client_id: ''
  });
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'EA', unit_price: 0, tax_rate: 0 }
  ]);

  useEffect(() => {
    fetchClients();
    if (isEditing) {
      fetchInvoice();
    }
  }, [isEditing, id]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/v1/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`/api/v1/invoices/${id}`);
      const invoice = response.data;
      
      setFormData({
        invoice_number: invoice.invoice_number,
        po_number: invoice.po_number || '',
        invoice_date: invoice.invoice_date.split('T')[0],
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        status: invoice.status,
        notes: invoice.notes || '',
        client_id: invoice.client_id
      });
      
      setItems(invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate
      })));
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unit_price' || field === 'tax_rate' 
        ? parseFloat(value) || 0 
        : value
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'EA', unit_price: 0, tax_rate: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      const itemTax = itemTotal * (item.tax_rate / 100);
      subtotal += itemTotal;
      totalTax += itemTax;
    });

    return {
      subtotal,
      totalTax,
      total: subtotal + totalTax
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        invoice_date: new Date(formData.invoice_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        items: items.filter(item => item.description && item.unit_price > 0)
      };

      if (isEditing) {
        await axios.put(`/api/v1/invoices/${id}`, payload);
      } else {
        await axios.post('/api/v1/invoices', payload);
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/invoices')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update invoice information' : 'Create a new invoice'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="INV-0001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number
              </label>
              <input
                type="text"
                name="po_number"
                value={formData.po_number}
                onChange={handleInputChange}
                className="input-field"
                placeholder="PO-12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tax %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="input-field text-sm"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="input-field text-sm w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="input-field text-sm w-16"
                        placeholder="EA"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="input-field text-sm w-24"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.tax_rate}
                        onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                        className="input-field text-sm w-16"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="card p-6">
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${totals.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>
      </form>
    </div>
  );
}
