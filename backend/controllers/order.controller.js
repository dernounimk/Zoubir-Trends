import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Setting from "../models/setting.model.js";

const generateUniqueOrderNumber = async () => {
  const chars = "0123456789";
  let orderNumber = "";
  let exists = true;

  while (exists) {
    orderNumber = "";
    for (let i = 0; i < 6; i++) {
      orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = await Order.findOne({ orderNumber });
  }

  return orderNumber;
};

export const createOrder = async (req, res) => {
  try {
    let {
      orderNumber,
      fullName,
      phoneNumber,
      wilaya,
      baladia,
      deliveryPlace,
      products,
      totalAmount,
      deliveryPrice,
      couponCode,
      note,
    } = req.body;

    // إذا لم يرسل رقم طلب أو للتأكد من تفرده، نولد رقم
    if (!orderNumber || await Order.findOne({ orderNumber })) {
      orderNumber = await generateUniqueOrderNumber();
    }

    let deliveryPhone = "";
    let coupon = null;

    if (couponCode) {
      const foundCoupon = await Coupon.findOne({ code: couponCode });
      if (foundCoupon) {
        coupon = {
          code: foundCoupon.code,
          discountAmount: foundCoupon.discountAmount,
        };
        await Coupon.deleteOne({ code: couponCode });
      }
    }

    const newOrder = new Order({
      orderNumber,
      fullName,
      phoneNumber,
      wilaya,
      baladia,
      deliveryPlace,
      deliveryPrice,
      note,
      totalAmount,
      products: products.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      })),
      coupon,
      deliveryPhone,
      isAskForPhone: false
    });

    await newOrder.save();

    res.status(201).json({ message: "Order created and coupon deleted", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الطلب" });
  }
};

export const editOrder = async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPhone } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "الطلبية غير موجودة" });

    order.deliveryPhone = deliveryPhone;
    await order.save();

    res.status(200).json({ message: "تم تحديث رقم هاتف عامل التوصيل", deliveryPhone: order.deliveryPhone });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التحديث" });
  }
};

export const askForPhone = async (req, res) => {
  const {orderNumber} = req.params;

  try {
    const foundOrder = await Order.findOne({orderNumber});
    if (!foundOrder) return res.status(404).json({ message: "الطلبية غير موجودة" });

    foundOrder.isAskForPhone = true;
    res.status(200).json({message : "تم تلقي طلبك"});
    await foundOrder.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الطلب" });
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("products.product");;
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "فشل في جلب الطلبيات" });
  }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id} = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Failed to delete order" });
    }
}

export const toggleConfirmOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds ||!Array.isArray(orderIds)) {
      return res.status(400).json({ message: "يجب تقديم مصفوفة من معرفات الطلبات" });
    }

    const orders = await Order.find({ _id: { $in: orderIds } });
    const allConfirmed = orders.every(o => o.isConfirmed);

    const newStatus =!allConfirmed;

    const updateData = { isConfirmed: newStatus };
    if (newStatus) {
      updateData.confirmedAt = new Date();
    } else {
      updateData.confirmedAt = null;
    }
    
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    res.status(200).json({
      message: newStatus? `تم تأكيد ${result.modifiedCount} طلبية`: `تم إلغاء تأكيد ${result.modifiedCount} طلبية`,
      count: result.modifiedCount,
      newStatus
    });
  } catch (error) {
    console.error("Error toggling confirmation:", error);
    res.status(500).json({ message: "فشل في تغيير حالة الطلبيات" });
  }
};

export const followOrder = async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const foundOrder = await Order.findOne({ orderNumber });

    if (!foundOrder) {
      return res.status(404).json({ message: "لم يتم العثور على الطلبية" });
    }

    const settings = await Setting.findOne().lean();
    if (!settings ||!settings.delivery) {
      return res.status(500).json({ message: "خطأ في إعدادات التوصيل" });
    }

    const deliverySetting = settings.delivery.find(d => d.state === foundOrder.wilaya);
    const deliveryDays = deliverySetting? deliverySetting.deliveryDays: 3; 

    const deliveryDurationMs = deliveryDays * 24 * 60 * 60 * 1000;

    let timeLeftMs = 0;

    if (foundOrder.isConfirmed) {
      const confirmedTime = foundOrder.confirmedAt? new Date(foundOrder.confirmedAt).getTime(): 0;

      const now = Date.now();
      timeLeftMs = deliveryDurationMs - (now - confirmedTime);
      if (timeLeftMs < 0) timeLeftMs = 0;
    }

    const orderDetail = {
      orderNumber,
      status: foundOrder.isConfirmed,
      deliveryAddress: `ولاية ${foundOrder.wilaya} بلدية ${foundOrder.baladia}`,
      estimatedDelivery: timeLeftMs,
      deliveryPhone: foundOrder.deliveryPhone,
      isAskForPhone: foundOrder.isAskForPhone
    };

    res.status(200).json(orderDetail);
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ message: "فشل في تتبع الطلبية" });
  }
};
