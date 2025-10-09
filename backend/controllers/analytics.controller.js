import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import Setting from "../models/setting.model.js";

/**
 * ✅ دالة جلب بيانات التحليلات العامة (المنتجات، الطلبات، الإيرادات...)
 */
export const getAnalyticsData = async () => {
  try {
    // 🧩 جلب إعدادات النظام لتحديد طريقة الحساب
    const settings = await Setting.findOne();
    const mode = settings?.orderCalculation || "all";
    const orderFilter = mode === "confirmed" ? { isConfirmed: true } : {};

    // 🧮 إحصائيات المنتجات
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const regularProducts = totalProducts - featuredProducts;

    // 🧮 إحصائيات الطلبات
    const totalOrders = await Order.countDocuments(orderFilter);
    const confirmedOrders = await Order.countDocuments({ isConfirmed: true });
    const pendingOrders = await Order.countDocuments({ isConfirmed: false });

    // 🧮 إحصائيات الكوبونات
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const inactiveCoupons = totalCoupons - activeCoupons;

    // 💰 إحصائيات الإيرادات (حسب الإعداد)
    const revenueData = await Order.aggregate([
      { $match: orderFilter },
      {
        $project: {
          products: 1,
          deliveryPrice: { $ifNull: ["$deliveryPrice", 0] },
          subtotal: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: { $multiply: ["$$product.price", "$$product.quantity"] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenueWithoutDelivery: { $sum: "$subtotal" },
          totalRevenueWithDelivery: { $sum: { $add: ["$subtotal", "$deliveryPrice"] } }
        }
      }
    ]);

    const result = revenueData[0] || {};

    // 🎟️ إحصائيات الخصومات
    const discountData = await Order.aggregate([
      {
        $match: {
          ...orderFilter,
          $or: [
            { discountAmount: { $gt: 0 } },
            { "coupon.discountAmount": { $gt: 0 } }
          ]
        }
      },
      {
        $addFields: {
          actualDiscount: {
            $ifNull: [
              "$discountAmount",
              { $ifNull: ["$coupon.discountAmount", 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDiscounts: { $sum: "$actualDiscount" },
          avgDiscountPerOrder: { $avg: "$actualDiscount" },
          ordersWithDiscount: { $sum: 1 }
        }
      }
    ]);

    const discountResult = discountData[0] || {
      totalDiscounts: 0,
      avgDiscountPerOrder: 0,
      ordersWithDiscount: 0
    };

    // 📊 تجميع النتيجة النهائية
    return {
      settings: {
        orderCalculation: mode,
      },
      products: {
        total: totalProducts,
        featured: featuredProducts,
        regular: regularProducts,
      },
      orders: {
        total: totalOrders,
        confirmed: confirmedOrders,
        pending: pendingOrders,
      },
      coupons: {
        total: totalCoupons,
        active: activeCoupons,
        inactive: inactiveCoupons,
      },
      revenue: {
        withDelivery: result.totalRevenueWithDelivery || 0,
        withoutDelivery: result.totalRevenueWithoutDelivery || 0,
        totalDiscounts: discountResult.totalDiscounts || 0,
        netWithDelivery:
          (result.totalRevenueWithDelivery || 0) -
          (discountResult.totalDiscounts || 0),
        netWithoutDelivery:
          (result.totalRevenueWithoutDelivery || 0) -
          (discountResult.totalDiscounts || 0),
        avgDiscount: discountResult.avgDiscountPerOrder || 0,
        ordersWithDiscount: discountResult.ordersWithDiscount || 0
      },
    };
  } catch (error) {
    console.error("Error in getAnalyticsData:", error.message);
    throw error;
  }
};

/**
 * ✅ دالة جلب المبيعات اليومية خلال فترة معينة
 */
export const getDailySalesData = async (startDate, endDate) => {
  try {
    const settings = await Setting.findOne();
    const mode = settings?.orderCalculation || "all";
    const orderFilter = mode === "confirmed" ? { isConfirmed: true } : {};

    const dailyOrdersData = await Order.aggregate([
      {
        $match: {
          ...orderFilter,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          createdAt: 1,
          products: 1,
          deliveryPrice: { $ifNull: ["$deliveryPrice", 0] },
          discountAmount: {
            $ifNull: [
              "$discountAmount",
              { $ifNull: ["$coupon.discountAmount", 0] },
            ],
          },
          subtotal: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: { $multiply: ["$$product.price", "$$product.quantity"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenueWithoutDelivery: { $sum: "$subtotal" },
          revenueWithDelivery: {
            $sum: { $add: ["$subtotal", "$deliveryPrice"] },
          },
          totalDiscounts: { $sum: "$discountAmount" },
          netRevenueWithoutDelivery: {
            $sum: { $subtract: ["$subtotal", "$discountAmount"] },
          },
          netRevenueWithDelivery: {
            $sum: {
              $subtract: [
                { $add: ["$subtotal", "$deliveryPrice"] },
                "$discountAmount",
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailyOrdersData.find((item) => item._id === date);
      return {
        date,
        orders: foundData?.orders || 0,
        revenueWithoutDelivery: foundData?.revenueWithoutDelivery || 0,
        revenueWithDelivery: foundData?.revenueWithDelivery || 0,
        totalDiscounts: foundData?.totalDiscounts || 0,
        netRevenueWithDelivery: foundData?.netRevenueWithDelivery || 0,
        netRevenueWithoutDelivery: foundData?.netRevenueWithoutDelivery || 0,
      };
    });
  } catch (error) {
    console.error("Error in getDailySalesData:", error.message);
    throw error;
  }
};

/**
 * 🗓️ دالة مساعدة لإنشاء قائمة تواريخ بين تاريخين
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
