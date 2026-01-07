import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Edit,
  Printer,
  Mail
} from 'lucide-react';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = () => {
    // This would generate a PDF version of the invoice
    // For now, we'll use the browser's print functionality
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aasko-blue"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/invoices')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
              <p className="text-gray-600">View and manage invoice details</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/invoices/${id}/edit`)}
              className="btn btn-secondary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={generatePDF}
              className="btn btn-secondary flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              className="btn btn-primary flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white" id="invoice-content">
        {/* Company Header */}
        <div className="border-b-2 border-aasko-blue pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-aasko-blue mb-2">Aasko Construction</h1>
              <p className="text-gray-600">123 Construction Ave, Building City</p>
              <p className="text-gray-600">+1-555-0123 | info@aasko.com</p>
              <p className="text-gray-600">www.aasko.com</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <div className="text-gray-700">
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.address && <p>{invoice.client.address}</p>}
              {invoice.client.phone && <p>{invoice.client.phone}</p>}
              {invoice.client.email && <p>{invoice.client.email}</p>}
              {invoice.client.ntn && <p>NTN: {invoice.client.ntn}</p>}
              {invoice.client.gst && <p>GST: {invoice.client.gst}</p>}
            </div>
          </div>
          
          <div className="text-right">
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Invoice Number:</span>
                <span className="ml-2 font-medium">{invoice.invoice_number}</span>
              </div>
              {invoice.po_number && (
                <div>
                  <span className="text-gray-600">PO Number:</span>
                  <span className="ml-2 font-medium">{invoice.po_number}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Invoice Date:</span>
                <span className="ml-2 font-medium">{formatDate(invoice.invoice_date)}</span>
              </div>
              {invoice.due_date && (
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(invoice.due_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  S/N
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Item Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                  Unit
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                  Qty
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                  Rate
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                    {item.unit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="5" className="border border-gray-300 px-4 py-2 text-right text-sm">
                  Subtotal:
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="5" className="border border-gray-300 px-4 py-2 text-right text-sm">
                  Tax:
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                  {formatCurrency(invoice.tax_amount)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="5" className="border border-gray-300 px-4 py-2 text-right text-sm">
                  Total:
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                  {formatCurrency(invoice.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Amount in Words */}
        {invoice.amount_in_words && (
          <div className="mb-8">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount in Words:</span> {invoice.amount_in_words}
            </p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex justify-end">
            <div className="text-center">
              <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
              <p className="text-sm text-gray-600">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
