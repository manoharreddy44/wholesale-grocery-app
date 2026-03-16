const Order = require('../models/Order');
const Customer = require('../models/Customer');

const getAnalytics = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaySalesResult = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
      { $project: { _id: 0, total: 1 } }
    ]);
    const todaySales = todaySalesResult[0]?.total ?? 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklySalesResult = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const weeklySales = weeklySalesResult.map((d) => ({ date: d._id, total: d.total }));

    const topProductsResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQty: { $sum: '$items.qty' }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 }
    ]);
    const topProducts = topProductsResult.map((p) => ({
      productId: p._id,
      name: p.name,
      totalQty: p.totalQty
    }));

    const topCustomersResult = await Order.aggregate([
      { $match: { status: 'completed', customerId: { $ne: null } } },
      { $group: { _id: '$customerId', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          customerId: '$_id',
          shopName: '$customer.shopName',
          ownerName: '$customer.ownerName',
          total: 1,
          _id: 0
        }
      }
    ]);
    const topCustomers = topCustomersResult;

    const dueResult = await Customer.aggregate([
      { $group: { _id: null, totalDue: { $sum: '$dueAmount' } } },
      { $project: { _id: 0, totalDue: 1 } }
    ]);
    const totalDue = dueResult[0]?.totalDue ?? 0;

    const pendingPaymentsCount = await Customer.countDocuments({ dueAmount: { $gt: 0 } });

    res.json({
      todaySales,
      weeklySales,
      topProducts,
      topCustomers,
      totalDue,
      pendingPaymentsCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch reports' });
  }
};

module.exports = { getAnalytics };
