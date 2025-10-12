import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: null },
  imageId: { type: String, default: null }
});

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["letter", "number"], default: "letter" }
});

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
});

const deliverySchema = new mongoose.Schema({
  state: { type: String, required: true },
  officePrice: { type: Number, default: 0 },
  homePrice: { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 3 }
});

const settingsSchema = new mongoose.Schema({
  categories: { 
    type: [categorySchema], 
    default: [] 
  },
  sizes: { 
    type: [sizeSchema], 
    default: [] 
  },
  colors: { 
    type: [colorSchema], 
    default: [] 
  },
  delivery: { 
    type: [deliverySchema], 
    default: [] 
  },
  orderCalculation: { 
    type: String, 
    enum: ["confirmed", "all"], 
    default: "all" 
  }
}, { 
  timestamps: true 
});

// تأكد من أن الحقول لا تكون undefined
settingsSchema.post('save', function(doc) {
  doc.categories = doc.categories || [];
  doc.sizes = doc.sizes || [];
  doc.colors = doc.colors || [];
  doc.delivery = doc.delivery || [];
  doc.orderCalculation = doc.orderCalculation || "all";
});

settingsSchema.post('find', function(docs) {
  docs.forEach(doc => {
    doc.categories = doc.categories || [];
    doc.sizes = doc.sizes || [];
    doc.colors = doc.colors || [];
    doc.delivery = doc.delivery || [];
    doc.orderCalculation = doc.orderCalculation || "all";
  });
});

settingsSchema.post('findOne', function(doc) {
  if (doc) {
    doc.categories = doc.categories || [];
    doc.sizes = doc.sizes || [];
    doc.colors = doc.colors || [];
    doc.delivery = doc.delivery || [];
    doc.orderCalculation = doc.orderCalculation || "all";
  }
});

const Setting = mongoose.model("Setting", settingsSchema);
export default Setting;