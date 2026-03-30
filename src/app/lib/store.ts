// Local storage-based data store for the invoice system

export interface Product {
  id: string;
  name: string;
  price: number;
  gstRate: number;
  stock?: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGSTIN?: string;
  customerAddress?: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: "paid" | "unpaid" | "partial";
  paidAmount: number;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface Business {
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  pan?: string;
  website?: string;
  onlineStore?: string;
  subCompany?: string;
  bankName?: string;
  ifsc?: string;
  accountNo?: string;
  bankBranch?: string;
  upiId?: string;
}

// Initialize with sample data
const initializeData = () => {
  const invoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "INV-001",
      customerId: "1",
      customerName: "Rajesh Kumar",
      customerPhone: "+91 98765 43210",
      customerGSTIN: "27AAPFU0939F1ZV",
      customerAddress: "123 MG Road, Mumbai",
      date: "2026-03-01",
      items: [
        {
          productId: "1",
          productName: "Website Design",
          quantity: 1,
          price: 50000,
          gstRate: 18,
          amount: 50000,
        },
        {
          productId: "2",
          productName: "SEO Optimization",
          quantity: 1,
          price: 15000,
          gstRate: 18,
          amount: 15000,
        },
      ],
      subtotal: 65000,
      cgst: 5850,
      sgst: 5850,
      igst: 0,
      total: 76700,
      status: "paid",
      paidAmount: 76700,
    },
    {
      id: "2",
      invoiceNumber: "INV-002",
      customerId: "2",
      customerName: "Priya Sharma",
      customerPhone: "+91 87654 32109",
      customerGSTIN: "29AABCU9603R1ZM",
      date: "2026-03-15",
      items: [
        {
          productId: "3",
          productName: "Mobile App Development",
          quantity: 1,
          price: 120000,
          gstRate: 18,
          amount: 120000,
        },
      ],
      subtotal: 120000,
      cgst: 10800,
      sgst: 10800,
      igst: 0,
      total: 141600,
      status: "partial",
      paidAmount: 70800,
    },
    {
      id: "3",
      invoiceNumber: "INV-003",
      customerId: "3",
      customerName: "Amit Patel",
      customerPhone: "+91 76543 21098",
      date: "2026-03-20",
      items: [
        {
          productId: "4",
          productName: "Logo Design",
          quantity: 1,
          price: 8000,
          gstRate: 18,
          amount: 8000,
        },
      ],
      subtotal: 8000,
      cgst: 720,
      sgst: 720,
      igst: 0,
      total: 9440,
      status: "unpaid",
      paidAmount: 0,
    },
  ];

  const customers: Customer[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@example.com",
      gstin: "27AAPFU0939F1ZV",
      address: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
    },
    {
      id: "2",
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya.sharma@example.com",
      gstin: "29AABCU9603R1ZM",
      address: "456 Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
    },
    {
      id: "3",
      name: "Amit Patel",
      phone: "+91 76543 21098",
      email: "amit.patel@example.com",
      address: "789 SG Highway",
      city: "Ahmedabad",
      state: "Gujarat",
    },
  ];

  const products: Product[] = [
    {
      id: "1",
      name: "Website Design",
      price: 50000,
      gstRate: 18,
      description: "Professional website design service",
    },
    {
      id: "2",
      name: "SEO Optimization",
      price: 15000,
      gstRate: 18,
      description: "Search engine optimization service",
    },
    {
      id: "3",
      name: "Mobile App Development",
      price: 120000,
      gstRate: 18,
      description: "Custom mobile app development",
    },
    {
      id: "4",
      name: "Logo Design",
      price: 8000,
      gstRate: 18,
      description: "Professional logo design",
    },
    {
      id: "5",
      name: "Content Writing",
      price: 5000,
      gstRate: 18,
      description: "Professional content writing service",
    },
  ];

  const business: Business = {
    name: "Digital Solutions Pvt Ltd",
    gstin: "27AAACD1234E1Z5",
    address: "100 Business Park, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 1234 5678",
    email: "info@digitalsolutions.com",
  };

  if (!localStorage.getItem("invoices")) {
    localStorage.setItem("invoices", JSON.stringify(invoices));
  }
  if (!localStorage.getItem("customers")) {
    localStorage.setItem("customers", JSON.stringify(customers));
  }
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  if (!localStorage.getItem("business")) {
    localStorage.setItem("business", JSON.stringify(business));
  }
  if (!localStorage.getItem("payments")) {
    localStorage.setItem("payments", JSON.stringify([]));
  }
};

initializeData();

// Invoice operations
export const getInvoices = (): Invoice[] => {
  return JSON.parse(localStorage.getItem("invoices") || "[]");
};

export const getInvoice = (id: string): Invoice | undefined => {
  const invoices = getInvoices();
  return invoices.find((inv) => inv.id === id);
};

export const saveInvoice = (invoice: Invoice) => {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem("invoices", JSON.stringify(invoices));
};

export const deleteInvoice = (id: string) => {
  const invoices = getInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem("invoices", JSON.stringify(invoices));
};

export const getNextInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const numbers = invoices
    .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
    .filter((num) => !isNaN(num));
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `INV-${String(maxNumber + 1).padStart(3, "0")}`;
};

// Customer operations
export const getCustomers = (): Customer[] => {
  return JSON.parse(localStorage.getItem("customers") || "[]");
};

export const getCustomer = (id: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find((cust) => cust.id === id);
};

export const saveCustomer = (customer: Customer) => {
  const customers = getCustomers();
  const index = customers.findIndex((cust) => cust.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem("customers", JSON.stringify(customers));
};

export const deleteCustomer = (id: string) => {
  const customers = getCustomers().filter((cust) => cust.id !== id);
  localStorage.setItem("customers", JSON.stringify(customers));
};

// Product operations
export const getProducts = (): Product[] => {
  return JSON.parse(localStorage.getItem("products") || "[]");
};

export const getProduct = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find((prod) => prod.id === id);
};

export const saveProduct = (product: Product) => {
  const products = getProducts();
  const index = products.findIndex((prod) => prod.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem("products", JSON.stringify(products));
};

export const deleteProduct = (id: string) => {
  const products = getProducts().filter((prod) => prod.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
};

// Payment operations
export const getPayments = (): Payment[] => {
  return JSON.parse(localStorage.getItem("payments") || "[]");
};

export const savePayment = (payment: Payment) => {
  const payments = getPayments();
  payments.push(payment);
  localStorage.setItem("payments", JSON.stringify(payments));
};

export const getPaymentsByInvoice = (invoiceId: string): Payment[] => {
  return getPayments().filter((payment) => payment.invoiceId === invoiceId);
};

// Business operations
export const getBusiness = (): Business => {
  return JSON.parse(localStorage.getItem("business") || "{}");
};

export const saveBusiness = (business: Business) => {
  localStorage.setItem("business", JSON.stringify(business));
};
