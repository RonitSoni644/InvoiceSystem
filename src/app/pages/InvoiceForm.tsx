import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, Save, X } from 'lucide-react';
import {
  getInvoice,
  saveInvoice,
  getNextInvoiceNumber,
  getCustomers,
  getProducts,
  Invoice,
  InvoiceItem
} from '../lib/store';
import { generateId, calculateGST } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import handleAdd from './Customers';
 
export function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');

  const customers = getCustomers();
  const products = getProducts();

  useEffect(() => {
    if (isEditing && id) {
      const invoice = getInvoice(id);
      if (invoice) {
        setInvoiceNumber(invoice.invoiceNumber);
        setCustomerId(invoice.customerId);
        setDate(invoice.date);
        setItems(invoice.items);
        setNotes(invoice.notes || '');
      }
    } else {
      setInvoiceNumber(getNextInvoiceNumber());
    }
  }, [id, isEditing]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
        gstRate: 18,
        amount: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].price = product.price;
        newItems[index].gstRate = product.gstRate;
      }
    }

    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate GST for each item and sum them up
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    items.forEach(item => {
      const gst = calculateGST(item.amount, item.gstRate, true);
      totalCGST += gst.cgst;
      totalSGST += gst.sgst;
      totalIGST += gst.igst;
    });

    const total = subtotal + totalCGST + totalSGST + totalIGST;

    return {
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      total
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const totals = calculateTotals();

    const invoice: Invoice = {
      id: isEditing && id ? id : generateId(),
      invoiceNumber,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerGSTIN: customer.gstin,
      customerAddress: customer.address,
      date,
      items,
      ...totals,
      status: 'unpaid',
      paidAmount: 0,
      notes
    };

    saveInvoice(invoice);
    toast.success(isEditing ? 'Invoice updated successfully' : 'Invoice created successfully');
    navigate('/invoices');
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Update invoice details' : 'Create a new invoice'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 ">
              
              <Label htmlFor="customer ">Customer</Label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="col-span-12 md:col-span-4">
                  <Label>Product/Service</Label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>GST %</Label>
                  <select
                    value={item.gstRate}
                    onChange={(e) => updateItem(index, 'gstRate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div className="col-span-6 md:col-span-2 flex items-end justify-between">
                  <div>
                    <Label>Amount</Label>
                    <div className="text-sm font-medium mt-2">
                      ₹{item.amount.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Click "Add Item" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Totals</h3>
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{totals.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{totals.sgst.toFixed(2)}</span>
              </div>
              {totals.igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST:</span>
                  <span className="font-medium">₹{totals.igst.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
