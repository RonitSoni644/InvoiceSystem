import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Download,
  Edit,
  Trash2,
  ArrowLeft,
  DollarSign,
  Scale,
} from "lucide-react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";

import {
  getInvoice,
  deleteInvoice,
  getBusiness,
  saveInvoice,
} from "../lib/store";
import { formatCurrency, formatDate, convertNumberToWords } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import logo from "./assets/IMG-20251220-WA0002.jpg";

export function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(getInvoice(id!));
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    if (!invoice) {
      navigate("/invoices");
    }
  }, [invoice, navigate]);

  if (!invoice) return null;

  const business = getBusiness();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      navigate("/invoices");
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    const remainingAmount = invoice.total - invoice.paidAmount;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > remainingAmount) {
      toast.error("Payment amount cannot exceed remaining amount");
      return;
    }

    const newPaidAmount = invoice.paidAmount + amount;
    let newStatus: "paid" | "unpaid" | "partial" = "partial";

    if (newPaidAmount >= invoice.total) {
      newStatus = "paid";
    } else if (newPaidAmount === 0) {
      newStatus = "unpaid";
    }

    const updatedInvoice = {
      ...invoice,
      paidAmount: newPaidAmount,
      status: newStatus,
    };

    saveInvoice(updatedInvoice);
    setInvoice(updatedInvoice);
    setShowPaymentDialog(false);
    setPaymentAmount("");
    toast.success("Payment recorded successfully");
  };
  const componentRef = useRef(null);

  const generatePdf = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${invoice.invoiceNumber}`,
    onAfterPrint: () => toast.success("Invoice downloaded successfully"),
    onPrintError: () => toast.error("Failed to generate Invoice "),
  });

  const remainingAmount = invoice.total - invoice.paidAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {invoice.status !== "paid" && (
            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}
          <Button onClick={generatePdf} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Link to={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div
        ref={componentRef}
        style={{ scale: 0.8 }}
        className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden p-6 print:max-w-[794px] print:shadow-none"
      >
        <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 mb-6">
          <div className="col-span-2">
            <p className="text-4xl font-extrabold tracking-tight">
              {business.name}
            </p>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Pan No: {business.pan || "AAGCV9438G"}
            </p>
            <p className="text-sm mt-1">
              {business.phone} | {business.email || "info@example.com"}
            </p>
            <p className="text-sm mt-1">
              {business.address}, {business.city}, {business.state}
            </p>
            <p className="text-sm mt-1">
              website: {business.website || "www.shreeramart.in"}
            </p>
            <p className="text-sm mt-1">
              online store:{" "}
              {business.onlineStore ||
                "https://demo.niobooks.in/store/sk_trading_company"}
            </p>
            <p className="text-sm mt-1">
              Sub Company: {business.subCompany || "Annpurna Catering"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">TAX INVOICE</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div className="border p-3 rounded text-left">
            <p className="font-semibold">Invoice No.</p>
            <p>{invoice.invoiceNumber}</p>
          </div>
          <div className="border p-3 rounded text-left">
            <p className="font-semibold">Invoice Date</p>
            <p>{formatDate(invoice.date)}</p>
          </div>
          <div className="border p-3 rounded text-left">
            <p className="font-semibold">Due Date</p>
            <p>{invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Bill To
            </h3>
            <p className="text-xl font-bold">{invoice.customerName}</p>
            <p className="text-sm">
              {invoice.customerAddress || "Address not provided"}
            </p>
            <p className="text-sm">Mobile {invoice.customerPhone}</p>
            {invoice.customerGSTIN && (
              <p className="text-sm font-semibold">
                GSTIN {invoice.customerGSTIN}
              </p>
            )}
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : invoice.status === "unpaid"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg mb-4">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-100 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Items</th>
                <th className="px-3 py-2 text-left">HSN No.</th>
                <th className="px-3 py-2 text-right">Qty.</th>
                <th className="px-3 py-2 text-right">MRP</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Tax</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invoice.items.map((item, index) => {
                const gstValue = (item.amount * item.gstRate) / 100;
                return (
                  <tr key={index}>
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2">
                      {(item as any).hsn || "9023000"}
                    </td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(gstValue)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-100 text-sm font-bold px-3 py-2 rounded mb-6 flex justify-between">
          <span>SUBTOTAL</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-3 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold">Terms & Conditions</h4>
            <ul className=" text-base text-gray-600 list-disc list-inside space-y-1">
              <li>
                Payment is due at the time of purchase; no credit offered.
              </li>
              <li>Goods cannot be returned or exchanged unless defective.</li>
              <li>
                All products are subject to availability, and prices may change
                without prior notice.
              </li>
              <li>
                The customer is responsible for checking product quality before
                purchase.
              </li>
              <li>
                Taxes applicable as per government regulations will be added to
                the final bill.
              </li>
            </ul>
          </div>
          <div className="border border-gray-200 p-4 rounded">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST</span>
                <span>{formatCurrency(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST</span>
                <span>{formatCurrency(invoice.sgst)}</span>
              </div>
              {invoice.igst > 0 && (
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span>{formatCurrency(invoice.igst)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2 font-bold flex justify-between">
                <span>Total Amount</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Received Amount</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Previous Balance</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Current Balance</span>
                <span>{formatCurrency(remainingAmount)}</span>
              </div>
              <div className="pt-2 text-xs">
                <span className="font-bold font-bold">Total Amount (in words)</span>
                <p>{convertNumberToWords(invoice.total)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3  gap-4 items-center">
          <div className="h-24  border border-gray-200 rounded flex items-center justify-center">
            <div className="space-y-1  ">
              <p className="text-xs font-semibold">Bank Details</p>
              <p className="text-xs">Name: {business.bankName || "rohit"}</p>
              <p className="text-xs">IFSC: {business.ifsc || "sbin0001703"}</p>
              <p className="text-xs">
                Account No: {business.accountNo || "3425322435376423"}
              </p>
              <p className="text-xs">
                Bank Name:{" "}
                {business.bankBranch || "State Bank of India, NARAINA"}
              </p>
            </div>
          </div>
          <div>
            {" "}
            <p className="text-xs font-semibold justify-content">UPI ID</p>
            <p className="text-xs">
              {business.upiId || "ronitsoni506-1@oksbi"}
            </p>
          </div>
          <div>
            {" "}
            <p className="text-xs font-semibold justify-content">UPI Number</p>
            <p className="text-xs">
              {business.upiId || "8955219443"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs">Signature</p>
            <p className="font-bold">{business.name}</p>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Total Amount: {formatCurrency(invoice.total)}
              </p>
              <p className="text-sm text-gray-600">
                Paid: {formatCurrency(invoice.paidAmount)}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Remaining: {formatCurrency(remainingAmount)}
              </p>
            </div>
            <div>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="bg-green-600 hover:bg-green-700"
              >
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
