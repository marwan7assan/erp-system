/**
 * BACKEND INTEGRATION NOTE:
 * To swap from mock data to real API endpoints once the backend is ready:
 * 1. Import the corresponding resource API from `../services/api.js` (e.g. `salesApi`, `inventoryApi`, etc.).
 * 2. In each page or custom hook, replace the static initial mock array with an asynchronous fetch call
 *    (e.g., `useEffect(() => { salesApi.list().then(setSales); }, [])`).
 * 3. Connect create/update/remove actions to their respective `api.create()`, `api.update()`, and `api.remove()` methods.
 */

// ==========================================
// Sales Mock Data
// ==========================================
export const initialSales = [
  {
    id: 1001,
    customer: "Ahmed Hassan",
    date: "2026-08-17",
    amount: 12500,
    status: "completed",
  },
  {
    id: 1002,
    customer: "Mohamed Ali",
    date: "2026-08-16",
    amount: 8500,
    status: "pending",
  },
  {
    id: 1003,
    customer: "Sara Ahmed",
    date: "2026-08-15",
    amount: 21000,
    status: "completed",
  },
  {
    id: 1004,
    customer: "Omar Khaled",
    date: "2026-08-14",
    amount: 6400,
    status: "cancelled",
  },
  {
    id: 1005,
    customer: "Mariam Samir",
    date: "2026-08-13",
    amount: 17500,
    status: "completed",
  },
];

export const dashboardTrends = {
  sales: "+12.5%",
  customers: "+8.2%",
  products: "+5.4%",
  orders: "-2.4%",
};

// ==========================================
// Purchases Mock Data
// ==========================================
export const initialPurchases = [
  {
    id: "PUR-001",
    supplier: "Tech Suppliers",
    product: "Laptop Dell",
    quantity: 5,
    amount: 45000,
    date: "2026-09-10",
    status: "completed",
  },
  {
    id: "PUR-002",
    supplier: "Office Solutions",
    product: "Office Chairs",
    quantity: 20,
    amount: 18000,
    date: "2026-09-12",
    status: "pending",
  },
  {
    id: "PUR-003",
    supplier: "Electro Store",
    product: "Monitors",
    quantity: 10,
    amount: 25000,
    date: "2026-09-14",
    status: "completed",
  },
  {
    id: "PUR-004",
    supplier: "Paper World",
    product: "A4 Paper",
    quantity: 50,
    amount: 7500,
    date: "2026-09-15",
    status: "cancelled",
  },
];

// ==========================================
// Inventory Mock Data
// ==========================================
export const initialProducts = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    sku: "WH-001",
    category: "Electronics",
    price: 1200,
    stock: 8,
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    sku: "OC-002",
    category: "Furniture",
    price: 3500,
    stock: 35,
  },
  {
    id: 3,
    name: "Fast USB-C Cable 2M",
    sku: "UC-003",
    category: "Accessories",
    price: 150,
    stock: 5,
  },
  {
    id: 4,
    name: "Aluminum Laptop Stand",
    sku: "LS-004",
    category: "Accessories",
    price: 750,
    stock: 0,
  },
  {
    id: 5,
    name: "Bluetooth Optical Mouse",
    sku: "WM-005",
    category: "Electronics",
    price: 450,
    stock: 62,
  },
];

// Derived status helper for inventory (0 => outOfStock, <=10 => lowStock, else inStock)
export const getProductStockStatus = (stock) => {
  if (stock === 0) return "outOfStock";
  if (stock <= 10) return "lowStock";
  return "inStock";
};

// ==========================================
// Customers Mock Data
// ==========================================
export const initialCustomers = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "01012345678",
    company: "Ahmed Trading Corp",
    orders: 24,
    status: "active",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara@example.com",
    phone: "01123456789",
    company: "Sara Modern Store",
    orders: 18,
    status: "active",
  },
  {
    id: 3,
    name: "Mohamed Ali",
    email: "mohamed@example.com",
    phone: "01234567890",
    company: "Ali Logistics Group",
    orders: 9,
    status: "inactive",
  },
  {
    id: 4,
    name: "Omar Khaled",
    email: "omar@example.com",
    phone: "01567890123",
    company: "Khaled Supplies",
    orders: 31,
    status: "active",
  },
  {
    id: 5,
    name: "Mariam Samir",
    email: "mariam@example.com",
    phone: "01098765432",
    company: "Mariam Boutique",
    orders: 15,
    status: "active",
  },
];

// ==========================================
// Suppliers Mock Data
// ==========================================
export const initialSuppliers = [
  {
    id: "SUP-001",
    name: "Al-Ahram Technology Ltd",
    contact: "Khaled Mansour",
    category: "Hardware & Electronics",
    phone: "01011223344",
    email: "info@ahramtech.com",
    balance: 85000,
    orders: 42,
    status: "active",
  },
  {
    id: "SUP-002",
    name: "Nile Office Furniture",
    contact: "Nadia Farouk",
    category: "Office Furniture",
    phone: "01233445566",
    email: "sales@nilefurniture.eg",
    balance: 24000,
    orders: 18,
    status: "active",
  },
  {
    id: "SUP-003",
    name: "Cairo Logistics & Paper",
    contact: "Sherif Adel",
    category: "Packaging & Stationery",
    phone: "01155667788",
    email: "contact@cairopaper.com",
    balance: 0,
    orders: 29,
    status: "active",
  },
  {
    id: "SUP-004",
    name: "Alexandria Cables Co.",
    contact: "Tarek Zaki",
    category: "Electrical Equipment",
    phone: "01599887766",
    email: "tarek@alexcables.com",
    balance: 15400,
    orders: 8,
    status: "inactive",
  },
];

// ==========================================
// Employees Mock Data
// ==========================================
export const initialEmployees = [
  {
    id: "EMP-101",
    name: "Youssef Ibrahim",
    role: "Senior Accountant",
    department: "Finance",
    email: "youssef@erpsystem.com",
    phone: "01022334455",
    salary: 18500,
    joinDate: "2024-03-15",
    status: "active",
  },
  {
    id: "EMP-102",
    name: "Salma Mahmoud",
    role: "HR Specialist",
    department: "Human Resources",
    email: "salma@erpsystem.com",
    phone: "01133445566",
    salary: 14000,
    joinDate: "2024-06-01",
    status: "active",
  },
  {
    id: "EMP-103",
    name: "Mostafa Hassan",
    role: "Warehouse Manager",
    department: "Operations",
    email: "mostafa@erpsystem.com",
    phone: "01244556677",
    salary: 16000,
    joinDate: "2023-11-10",
    status: "active",
  },
  {
    id: "EMP-104",
    name: "Dina Samir",
    role: "Sales Executive",
    department: "Sales",
    email: "dina@erpsystem.com",
    phone: "01555667788",
    salary: 13500,
    joinDate: "2025-01-20",
    status: "onLeave",
  },
  {
    id: "EMP-105",
    name: "Amr Nabil",
    role: "IT Support Engineer",
    department: "IT",
    email: "amr@erpsystem.com",
    phone: "01099887711",
    salary: 15000,
    joinDate: "2024-08-12",
    status: "inactive",
  },
];

// ==========================================
// Accounting Mock Data
// ==========================================
export const initialTransactions = [
  {
    id: "TX-901",
    description: "Client Bulk Order Payment #1001",
    category: "Product Sales",
    type: "income",
    amount: 125000,
    date: "2026-09-01",
    status: "paid",
  },
  {
    id: "TX-902",
    description: "Supplier Dell Invoice PUR-001",
    category: "Inventory Purchases",
    type: "expense",
    amount: 45000,
    date: "2026-09-03",
    status: "paid",
  },
  {
    id: "TX-903",
    description: "Headquarters Office Rent",
    category: "Rent & Utilities",
    type: "expense",
    amount: 22000,
    date: "2026-09-05",
    status: "paid",
  },
  {
    id: "TX-904",
    description: "Consulting & Custom Solutions",
    category: "Services",
    type: "income",
    amount: 68000,
    date: "2026-09-08",
    status: "paid",
  },
  {
    id: "TX-905",
    description: "Monthly Staff Payroll",
    category: "Salaries",
    type: "expense",
    amount: 77000,
    date: "2026-09-10",
    status: "pending",
  },
  {
    id: "TX-906",
    description: "Software Licenses & Cloud Server",
    category: "IT & Software",
    type: "expense",
    amount: 14500,
    date: "2026-09-12",
    status: "paid",
  },
];

export const monthlyFinancialData = [
  { month: "Apr", income: 180000, expense: 110000 },
  { month: "May", income: 210000, expense: 125000 },
  { month: "Jun", income: 195000, expense: 130000 },
  { month: "Jul", income: 240000, expense: 140000 },
  { month: "Aug", income: 275000, expense: 155000 },
  { month: "Sep", income: 293000, expense: 158500 },
];

// ==========================================
// Dashboard Mock Data
// ==========================================
export const dashboardSalesData = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 53000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 62000 },
  { month: "May", sales: 71000 },
  { month: "Jun", sales: 68000 },
];

export const dashboardRecentOrders = [
  { id: "#1001", customer: "John Smith", amount: 4500, status: "completed" },
  { id: "#1002", customer: "Sarah Ahmed", amount: 3200, status: "pending" },
  { id: "#1003", customer: "Michael Brown", amount: 7800, status: "completed" },
  { id: "#1004", customer: "Emma Wilson", amount: 2150, status: "cancelled" },
];

// ==========================================
// Reports Mock Data (2026 & 2025)
// ==========================================
export const reportsPerformanceData2026 = [
  { month: "Jan", sales: 165000, purchases: 95000, expenses: 32000, net: 38000, growth: "+8.5%" },
  { month: "Feb", sales: 182000, purchases: 102000, expenses: 35000, net: 45000, growth: "+10.3%" },
  { month: "Mar", sales: 195000, purchases: 110000, expenses: 36000, net: 49000, growth: "+7.1%" },
  { month: "Apr", sales: 210000, purchases: 118000, expenses: 39000, net: 53000, growth: "+7.7%" },
  { month: "May", sales: 245000, purchases: 135000, expenses: 42000, net: 68000, growth: "+16.6%" },
  { month: "Jun", sales: 230000, purchases: 125000, expenses: 41000, net: 64000, growth: "-6.1%" },
  { month: "Jul", sales: 268000, purchases: 142000, expenses: 44000, net: 82000, growth: "+16.5%" },
  { month: "Aug", sales: 285000, purchases: 151000, expenses: 46000, net: 88000, growth: "+6.3%" },
  { month: "Sep", sales: 298000, purchases: 156000, expenses: 48000, net: 94000, growth: "+4.5%" },
];

export const reportsPerformanceData2025 = [
  { month: "Jan", sales: 140000, purchases: 82000, expenses: 28000, net: 30000, growth: "+5.2%" },
  { month: "Feb", sales: 148000, purchases: 88000, expenses: 30000, net: 30000, growth: "+5.7%" },
  { month: "Mar", sales: 160000, purchases: 94000, expenses: 31000, net: 35000, growth: "+8.1%" },
  { month: "Apr", sales: 172000, purchases: 100000, expenses: 33000, net: 39000, growth: "+7.5%" },
  { month: "May", sales: 190000, purchases: 112000, expenses: 35000, net: 43000, growth: "+10.4%" },
  { month: "Jun", sales: 185000, purchases: 108000, expenses: 34000, net: 43000, growth: "-2.6%" },
  { month: "Jul", sales: 215000, purchases: 124000, expenses: 37000, net: 54000, growth: "+16.2%" },
  { month: "Aug", sales: 228000, purchases: 130000, expenses: 39000, net: 59000, growth: "+6.0%" },
  { month: "Sep", sales: 240000, purchases: 136000, expenses: 41000, net: 63000, growth: "+5.2%" },
];

export const reportsPerformanceByYear = {
  "2026": reportsPerformanceData2026,
  "2025": reportsPerformanceData2025,
};

export const expenseCategoryData = [
  { category: "Salaries", amount: 77000 },
  { category: "Inventory", amount: 156000 },
  { category: "Rent & Utilities", amount: 22000 },
  { category: "Marketing", amount: 18500 },
  { category: "IT Infrastructure", amount: 14500 },
  { category: "Logistics", amount: 12000 },
];
