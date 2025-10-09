// models/setting.model.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String }
});

const sizeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["letter", "number"], default: "letter" }
});

const colorSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  hex: { type: String }
});

const deliverySchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  officePrice: { type: Number, default: 0 },
  homePrice: { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 3 }
});

const settingsSchema = new mongoose.Schema({
  categories: [categorySchema],
  sizes: [sizeSchema],
  colors: [colorSchema],
  delivery: [deliverySchema],
  orderCalculation: { type: String, enum: ["confirmed", "all"], default: "all" }
}, { timestamps: true });

const Setting = mongoose.model("Setting", settingsSchema);
export default Setting;
