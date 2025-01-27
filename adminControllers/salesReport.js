const mongoose = require('mongoose');
const Order = require('../models/OrderModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, format } = require('date-fns');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

// Helper function to calculate discounts
const calculateProductDiscount = async (product) => {
    try {
        const productDoc = await Product.findById(product.productId).populate('categoryId');
        if (!productDoc) return 0;

        const baseAmount = product.price * product.quantity;
        let totalDiscount = 0;

        // Calculate product offer discount
        if (productDoc.productOffer && productDoc.productOffer.type) {
            if (productDoc.productOffer.type === 'percentage') {
                totalDiscount += (baseAmount * productDoc.productOffer.value) / 100;
            } else if (productDoc.productOffer.type === 'flat') {
                totalDiscount += productDoc.productOffer.value * product.quantity;
            }
        }

        // Calculate category discount if applicable
        const category = productDoc.categoryId;
        if (category && category.discount && category.discount.type && 
            category.discount.expiryDate && new Date() < new Date(category.discount.expiryDate)) {
            
            if (category.discount.type === 'percentage') {
                totalDiscount += (baseAmount * category.discount.value) / 100;
            } else if (category.discount.type === 'flat') {
                totalDiscount += category.discount.value * product.quantity;
            }
        }

        return totalDiscount;
    } catch (error) {
        console.error('Error calculating product discount:', error);
        return 0;
    }
};

const getChartData = async (orders) => {
    // Group orders by date
    const ordersByDate = orders.reduce((acc, order) => {
        const date = format(new Date(order.orderDate), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = {
                orders: [],
                totalSales: 0,
                orderCount: 0,
                totalDiscount: 0
            };
        }
        acc[date].orders.push(order);
        acc[date].orderCount += 1;
        return acc;
    }, {});

    // Calculate metrics for each date
    const chartData = await Promise.all(
        Object.entries(ordersByDate).map(async ([date, data]) => {
            // Calculate discounts for each order
            const ordersWithDiscounts = await Promise.all(data.orders.map(async (order) => {
                const productDiscounts = await Promise.all(order.products.map(calculateProductDiscount));
                const totalDiscount = productDiscounts.reduce((sum, discount) => sum + discount, 0);
                return {
                    ...order.toObject(),
                    discount: totalDiscount,
                    finalPrice: order.totalPrice - totalDiscount
                };
            }));

            return {
                _id: date,
                totalSales: ordersWithDiscounts.reduce((sum, order) => sum + order.finalPrice, 0),
                totalDiscount: ordersWithDiscounts.reduce((sum, order) => sum + order.discount, 0),
                orderCount: data.orderCount
            };
        })
    );

    // Sort by date
    return chartData.sort((a, b) => new Date(a._id) - new Date(b._id));
};

const getSalesReport = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const orders = await getFilteredOrders(filterType, startDate, endDate);

        // Calculate discounts for each order
        const ordersWithDiscounts = await Promise.all(orders.map(async (order) => {
            const productDiscounts = await Promise.all(order.products.map(calculateProductDiscount));
            const totalDiscount = productDiscounts.reduce((sum, discount) => sum + discount, 0);
            return {
                ...order.toObject(),
                discount: totalDiscount,
                finalPrice: order.totalPrice - totalDiscount
            };
        }));

        const summary = {
            totalOrders: ordersWithDiscounts.length,
            totalSales: ordersWithDiscounts.reduce((sum, order) => sum + order.finalPrice, 0),
            totalDiscounts: ordersWithDiscounts.reduce((sum, order) => sum + order.discount, 0),
            averageOrderValue: ordersWithDiscounts.length ? 
                ordersWithDiscounts.reduce((sum, order) => sum + order.finalPrice, 0) / ordersWithDiscounts.length : 0,
            totalProducts: ordersWithDiscounts.reduce((sum, order) => 
                sum + order.products.reduce((pSum, p) => pSum + p.quantity, 0), 0)
        };

        // Get order details with discounts
        const orderDetails = ordersWithDiscounts.map(order => ({
            orderId: order._id,
            orderDate: order.orderDate,
            products: order.products.map(product => ({
                name: product.productName,
                quantity: product.quantity,
                price: product.price
            })),
            paymentMethod: order.paymentMethod,
            subtotal: order.totalPrice + order.discount,
            discount: order.discount,
            totalAmount: order.finalPrice
        }));

        // Get chart data
        const chartData = await getChartData(orders);

        // Get product performance
        const productPerformance = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                summary,
                orderDetails,
                productPerformance,
                chartData
            }
        });
    } catch (error) {
        console.error('Error getting sales report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales report',
            error: error.message
        });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const orders = await getFilteredOrders(filterType, startDate, endDate);
        const summary = calculateSummary(orders);

        // Get order details
        const orderDetails = orders.map(order => ({
            orderId: order._id,
            orderDate: order.orderDate,
            products: order.products.map(product => ({
                name: product.productName,
                quantity: product.quantity,
                price: product.price
            })),
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalPrice
        }));

        // Get product performance
        const productPerformance = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        // Get chart data
        const chartData = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary,
                orderDetails,
                productPerformance,
                chartData
            }
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// Helper function to get date range based on filter type
const getDateRange = (filterType) => {
    const now = new Date();
    switch (filterType) {
        case 'today':
            return {
                start: startOfDay(now),
                end: endOfDay(now)
            };
        case 'weekly':
            return {
                start: startOfWeek(now),
                end: endOfWeek(now)
            };
        case 'monthly':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now)
            };
        default:
            return {
                start: startOfDay(now),
                end: endOfDay(now)
            };
    }
};

// Helper function to get date filter
const getDateFilter = (filterType, startDate, endDate) => {
    if (filterType === 'custom' && startDate && endDate) {
        return {
            orderDate: {
                $gte: startOfDay(parseISO(startDate)),
                $lte: endOfDay(parseISO(endDate))
            }
        };
    }
    const range = getDateRange(filterType);
    return {
        orderDate: {
            $gte: range.start,
            $lte: range.end
        }
    };
};

// Helper function to get filtered orders
const getFilteredOrders = async (filterType, startDate, endDate) => {
    let dateFilter = getDateFilter(filterType, startDate, endDate);
    dateFilter.status = 'Delivered';
    return Order.find(dateFilter).sort({ orderDate: -1 });
};

// Helper function to calculate summary
const calculateSummary = (orders) => ({
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length : 0,
    totalProducts: orders.reduce((sum, order) => 
        sum + order.products.reduce((pSum, p) => pSum + p.quantity, 0), 0)
});

// Helper function to format currency in INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Check if there are any orders
const checkOrders = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                deliveredOrders,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Error checking orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking orders',
            error: error.message
        });
    }
};

// Get overall sales statistics
const getOverallStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({ status: 'Delivered' });
        const totalSales = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const topProducts = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    totalQuantity: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalSales: totalSales[0]?.total || 0,
                topProducts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching overall statistics',
            error: error.message
        });
    }
};

const downloadSalesReportPDF = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const orders = await getFilteredOrders(filterType, startDate, endDate);
        const summary = calculateSummary(orders);
        
        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        const filename = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);

        // Add header
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        
        // Add date range
        doc.fontSize(12)
            .text(`Report Period: ${filterType.toUpperCase()}`, { align: 'left' })
            .text(`Generated on: ${format(new Date(), 'PPpp')}`, { align: 'left' });
        doc.moveDown();

        // Add summary section
        doc.fontSize(16).text('Summary', { underline: true });
        doc.fontSize(12)
            .text(`Total Orders: ${summary.totalOrders}`)
            .text(`Total Sales: ${formatCurrency(summary.totalSales)}`)
            .text(`Average Order Value: ${formatCurrency(summary.averageOrderValue)}`)
            .text(`Total Products Sold: ${summary.totalProducts}`);
        doc.moveDown();

        // Add payment methods summary
        const paymentStats = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);

        doc.fontSize(16).text('Payment Methods', { underline: true });
        paymentStats.forEach(stat => {
            doc.fontSize(12).text(
                `${stat._id}: ${stat.count} orders - Total: ${formatCurrency(stat.total)}`
            );
        });
        doc.moveDown();

        // Add detailed orders table
        doc.fontSize(16).text('Order Details', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        const tableHeaders = ['Date', 'Order ID', 'Products', 'Payment', 'Total'];
        const colWidths = [80, 70, 200, 70, 70];
        let currentY = tableTop;

        // Draw table headers
        doc.fontSize(10);
        let currentX = 50;
        tableHeaders.forEach((header, i) => {
            doc.text(header, currentX, currentY, { width: colWidths[i], align: 'left' });
            currentX += colWidths[i];
        });
        currentY += 20;

        // Draw table rows
        orders.forEach((order, index) => {
            // Check if we need a new page
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 50;
                
                // Redraw headers on new page
                currentX = 50;
                doc.fontSize(10);
                tableHeaders.forEach((header, i) => {
                    doc.text(header, currentX, currentY, { width: colWidths[i], align: 'left' });
                    currentX += colWidths[i];
                });
                currentY += 20;
            }

            // Format order data
            const orderDate = format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm');
            const orderId = order._id.toString().slice(-6);
            const products = order.products
                .map(p => `${p.productName} (${p.quantity})`)
                .join(', ');
            const payment = order.paymentMethod;
            const total = formatCurrency(order.totalPrice);

            // Draw row
            currentX = 50;
            const rowHeight = Math.max(
                ...order.products.map(() => 12)
            );

            // Draw cell backgrounds alternately
            if (index % 2 === 0) {
                doc.fillColor('#f8f9fa')
                   .rect(currentX, currentY, sum(colWidths), rowHeight)
                   .fill();
            }
            doc.fillColor('#000000');

            // Draw cells
            doc.text(orderDate, currentX, currentY, { width: colWidths[0] });
            currentX += colWidths[0];
            doc.text(orderId, currentX, currentY, { width: colWidths[1] });
            currentX += colWidths[1];
            doc.text(products, currentX, currentY, { width: colWidths[2] });
            currentX += colWidths[2];
            doc.text(payment, currentX, currentY, { width: colWidths[3] });
            currentX += colWidths[3];
            doc.text(total, currentX, currentY, { width: colWidths[4], align: 'right' });

            currentY += rowHeight;
        });

        // Add product performance section
        doc.addPage();
        doc.fontSize(16).text('Top Performing Products', { underline: true });
        doc.moveDown();

        const productPerformance = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        // Draw product performance table
        const productHeaders = ['Product', 'Quantity Sold', 'Revenue'];
        const productColWidths = [250, 100, 100];
        
        currentX = 50;
        productHeaders.forEach((header, i) => {
            doc.text(header, currentX, doc.y, { width: productColWidths[i], align: 'left' });
            currentX += productColWidths[i];
        });
        doc.moveDown();

        productPerformance.forEach((product, index) => {
            currentX = 50;
            doc.text(product.productName, currentX, doc.y, { width: productColWidths[0] });
            currentX += productColWidths[0];
            doc.text(product.totalQuantity.toString(), currentX, doc.y, { width: productColWidths[1] });
            currentX += productColWidths[1];
            doc.text(formatCurrency(product.totalRevenue), currentX, doc.y, { width: productColWidths[2], align: 'right' });
            doc.moveDown(0.5);
        });

        // Add footer
        doc.fontSize(10)
           .text(
               `Report generated on ${format(new Date(), 'PPpp')}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
           );

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating PDF report',
            error: error.message
        });
    }
};

// Helper function to sum array values
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const downloadSalesReportExcel = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const orders = await getFilteredOrders(filterType, startDate, endDate);
        const summary = calculateSummary(orders);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create Report Info worksheet
        const reportInfoData = [
            ['Sales Report'],
            [''],
            ['Report Details'],
            ['Generated On', format(new Date(), 'PPpp')],
            ['Period', filterType.toUpperCase()],
            ['Date Range', filterType === 'custom' ? 
                `${format(parseISO(startDate), 'PP')} to ${format(parseISO(endDate), 'PP')}` :
                `${format(getDateRange(filterType).start, 'PP')} to ${format(getDateRange(filterType).end, 'PP')}`
            ],
            [''],
            ['Summary Statistics'],
            ['Total Orders', summary.totalOrders],
            ['Total Sales', formatCurrency(summary.totalSales)],
            ['Average Order Value', formatCurrency(summary.averageOrderValue)],
            ['Total Products Sold', summary.totalProducts]
        ];
        const reportInfoWS = XLSX.utils.aoa_to_sheet(reportInfoData);
        XLSX.utils.book_append_sheet(wb, reportInfoWS, 'Report Info');

        // Get payment statistics
        const paymentStats = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);

        // Create Payment Methods worksheet
        const paymentMethodsData = [
            ['Payment Method Analysis'],
            [''],
            ['Payment Method', 'Number of Orders', 'Total Revenue', 'Average Order Value'],
            ...paymentStats.map(stat => [
                stat._id,
                stat.count,
                formatCurrency(stat.total),
                formatCurrency(stat.total / stat.count)
            ])
        ];
        const paymentMethodsWS = XLSX.utils.aoa_to_sheet(paymentMethodsData);
        XLSX.utils.book_append_sheet(wb, paymentMethodsWS, 'Payment Methods');

        // Create detailed orders worksheet
        const ordersWithDiscounts = await Promise.all(orders.map(async (order) => {
            const productDiscounts = await Promise.all(order.products.map(calculateProductDiscount));
            const totalDiscount = productDiscounts.reduce((sum, discount) => sum + discount, 0);
            return {
                ...order.toObject(),
                discount: totalDiscount,
                finalPrice: order.totalPrice - totalDiscount
            };
        }));

        const orderDetails = ordersWithDiscounts.map(order => ({
            'Order Date': format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm'),
            'Order ID': order._id,
            'Products': order.products.map(p => `${p.productName} (${p.quantity})`).join(', '),
            'Number of Items': order.products.reduce((sum, p) => sum + p.quantity, 0),
            'Payment Method': order.paymentMethod,
            'Subtotal': formatCurrency(order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)),
            'Discount Applied': formatCurrency(order.discount || 0),
            'Coupon Code': order.couponCode || 'N/A',
            'Total Amount': formatCurrency(order.finalPrice),
            'Status': order.status
        }));
        const ordersWS = XLSX.utils.json_to_sheet(orderDetails);
        XLSX.utils.book_append_sheet(wb, ordersWS, 'Order Details');

        // Get and create product performance worksheet
        const productPerformance = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",
                    productName: { $first: "$products.productName" },
                    totalQuantity: { $sum: "$products.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                    averagePrice: { $avg: "$products.price" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const productPerformanceData = productPerformance.map(product => ({
            'Product Name': product.productName,
            'Total Quantity Sold': product.totalQuantity,
            'Total Revenue': formatCurrency(product.totalRevenue),
            'Average Price': formatCurrency(product.averagePrice),
            'Number of Orders': product.orderCount,
            'Average Quantity per Order': (product.totalQuantity / product.orderCount).toFixed(2)
        }));
        const productPerformanceWS = XLSX.utils.json_to_sheet(productPerformanceData);
        XLSX.utils.book_append_sheet(wb, productPerformanceWS, 'Product Performance');

        // Daily Sales Analysis
        const dailySales = await Order.aggregate([
            { $match: { ...getDateFilter(filterType, startDate, endDate), status: 'Delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalPrice" },
                    totalItems: {
                        $sum: { $reduce: { 
                            input: "$products", 
                            initialValue: 0, 
                            in: { $add: ["$$value", "$$this.quantity"] } 
                        }}
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const dailySalesData = dailySales.map(day => ({
            'Date': day._id,
            'Number of Orders': day.orderCount,
            'Total Sales': formatCurrency(day.totalSales),
            'Average Order Value': formatCurrency(day.averageOrderValue),
            'Total Items Sold': day.totalItems
        }));
        const dailySalesWS = XLSX.utils.json_to_sheet(dailySalesData);
        XLSX.utils.book_append_sheet(wb, dailySalesWS, 'Daily Sales');

        // Set column widths for better readability
        const setColumnWidths = (worksheet) => {
            const columnWidths = [];
            for (const key in worksheet) {
                if (key[0] === '!') continue;
                const cell = worksheet[key];
                const column = key.replace(/[0-9]/g, '');
                columnWidths[column] = Math.max(
                    columnWidths[column] || 0,
                    cell.v ? cell.v.toString().length : 0
                );
            }
            worksheet['!cols'] = columnWidths.map(width => ({ wch: Math.min(width + 2, 50) }));
        };

        [reportInfoWS, paymentMethodsWS, ordersWS, productPerformanceWS, dailySalesWS]
            .forEach(setColumnWidths);

        // Generate Excel file
        const filename = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel report',
            error: error.message
        });
    }
};

module.exports = {
    getSalesReport,
    getOverallStats,
    checkOrders,
    getDashboardData,
    downloadSalesReportPDF,
    downloadSalesReportExcel
};