const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } = require('date-fns'); // Date-fns for date manipulation
const Orders = require('../models/OrderModel');
const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel');

// Utility function to filter by date range
const filterOrdersByDate = (dateRange) => {
  switch (dateRange) {
    case 'daily':
      return { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) };
    case 'weekly':
      return { $gte: startOfWeek(new Date()), $lte: endOfWeek(new Date()) };
    case 'yearly':
      return { $gte: startOfYear(new Date()), $lte: endOfYear(new Date()) };
    case 'custom':
      return (startDate, endDate) => {
        return { $gte: new Date(startDate), $lte: new Date(endDate) };
      };
    default:
      return {};
  }
};

// Total sales function
const totalSales = async (req, res) => {
  const { dateRange, startDate, endDate } = req.body;

  try {
    const dateFilter = filterOrdersByDate(dateRange);
    
    const deliveredOrders = await Orders.aggregate([
      {
        $match: {
          status: 'Delivered',
          orderDate: dateRange === 'custom' ? dateFilter(startDate, endDate) : dateFilter,
        },
      },
      { $unwind: '$products' },
      { $match: { 'products.isProductReturned': false } },
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: '$totalPrice' }
        },
      },
    ]);

    if (deliveredOrders.length === 0) {
      return res.status(200).json({ message: "No sales data available" });
    }

    const totalSalesAmount = deliveredOrders[0].totalSalesAmount;
    res.status(200).json({ totalSales: totalSalesAmount });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Total discounts function
const totalDiscounts = async (req, res) => {
  const { dateRange, startDate, endDate } = req.body;

  try {
    const dateFilter = filterOrdersByDate(dateRange);

    let totalDiscount = 0;
    const activeCoupons = await Coupon.find({ isActive: true });

    for (let coupon of activeCoupons) {
      const discountAmount = coupon.discount;
      const usedCount = coupon.usedBy.length;
      totalDiscount += discountAmount * usedCount;
    }

    const activeCategories = await Category.find({ isActive: true, isDeleted: false });

    for (let category of activeCategories) {
      if (category.discount?.value && category.discount.expiryDate > new Date()) {
        const discountValue = category.discount.value;
        totalDiscount += discountValue;
      }
    }

    res.status(200).json({ totalDiscounts: totalDiscount });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Total order amount function
const orderAmount = async (req, res) => {
  const { dateRange, startDate, endDate } = req.body;

  try {
    const dateFilter = filterOrdersByDate(dateRange);

    const totalOrderAmount = await Orders.aggregate([
      {
        $match: {
          status: 'Delivered',
          orderDate: dateRange === 'custom' ? dateFilter(startDate, endDate) : dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' }
        },
      },
    ]);

    if (totalOrderAmount.length === 0) {
      return res.status(200).json({ message: "No order data available" });
    }

    const totalAmount = totalOrderAmount[0].totalAmount;
    res.status(200).json({ totalOrderAmount: totalAmount });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { totalSales, totalDiscounts, orderAmount };
