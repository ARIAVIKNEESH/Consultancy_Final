require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const departmentSchema = new mongoose.Schema({
  ondate_prod: { type: Number, default: 0 },
  ondate_hands: { type: Number, default: 0 },
});

const ProductionSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  MIXING: departmentSchema,
  BR_CDG: departmentSchema,
  PREDRG: departmentSchema,
  LH15: departmentSchema,
  COMBER: departmentSchema,
  DRG: departmentSchema,
  SMX: departmentSchema,
  SPG: departmentSchema,
  ACWDG: departmentSchema,
  PACKBAGS: departmentSchema,
});
const Production = mongoose.model("Production", ProductionSchema);

const sectionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: String, required: true },
  lifeInDays: { type: Number, default: 0 },
  lifeInMonths: { type: Number, default: 0 },
  nextSchedule: { type: String, default: "" },
});
const ElectricalSchema = new mongoose.Schema({
  date: { type: String, required: true },
  sections: {
    TOP_APRON: sectionSchema,
    MIDDLE_APRON: sectionSchema,
    BOTTOM_APRON: sectionSchema,
  },
});
const Electrical = mongoose.model("Electrical", ElectricalSchema);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({ success: true, message: "Signup successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.password === password) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/production/add", async (req, res) => {
  const { date, ...departments } = req.body;
  try {
    const update = {};
    Object.entries(departments).forEach(([dept, values]) => {
      update[`${dept}.ondate_prod`] = values.ondate_prod;
      update[`${dept}.ondate_hands`] = values.ondate_hands;
    });

    const result = await Production.findOneAndUpdate(
      { date },
      { $inc: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Production data added or updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save data", error: error.message });
  }
});

app.post("/production/update", async (req, res) => {
  const { date, ...departments } = req.body;
  try {
    const update = {};
    Object.entries(departments).forEach(([dept, values]) => {
      update[`${dept}.ondate_prod`] = values.ondate_prod;
      update[`${dept}.ondate_hands`] = values.ondate_hands;
    });

    const result = await Production.findOneAndUpdate(
      { date },
      { $set: update },
      { new: true }
    );

    if (!result) return res.status(404).json({ message: "No production data found for the given date." });
    res.json({ message: "Production data updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating production data.", error: error.message });
  }
});

app.get("/production/selected-date/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const productionData = await Production.findOne({ date });
    res.json(productionData || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/cumulative/production/:month", async (req, res) => {
  const { month } = req.params;
  try {
    const records = await Production.find({ date: { $regex: `^${month}` } });
    const departments = ["MIXING", "BR_CDG", "PREDRG", "LH15", "COMBER", "DRG", "SMX", "SPG", "ACWDG", "PACKBAGS"];

    const cumulative = {};
    departments.forEach((dept) => {
      cumulative[dept] = { ondate_prod: 0, ondate_hands: 0 };
    });

    records.forEach((record) => {
      departments.forEach((dept) => {
        if (record[dept]) {
          cumulative[dept].ondate_prod += record[dept].ondate_prod || 0;
          cumulative[dept].ondate_hands += record[dept].ondate_hands || 0;
        }
      });
    });

    res.json(cumulative);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-electrical", async (req, res) => {
  try {
    const { date, sections } = req.body;
    if (!date || !sections || typeof sections !== "object") {
      return res.status(400).json({ message: "Invalid data format received." });
    }
    let record = await Electrical.findOne({ date });
    if (record) {
      Object.keys(sections).forEach((section) => {
        if (record.sections[section]) {
          record.sections[section] = { ...sections[section] };
        }
      });
      await record.save();
      res.status(200).json({ message: "Data updated successfully!" });
    } else {
      const newRecord = new Electrical({ date, sections });
      await newRecord.save();
      res.status(201).json({ message: "Data added successfully!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to save data.", error: error.message });
  }
});

app.get("/electrical-all", async (req, res) => {
  try {
    const records = await Electrical.find().sort({ date: -1 });
    if (!records.length) {
      return res.status(404).json({ message: "No electrical records found." });
    }
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch electrical data.", error: error.message });
  }
});

app.get("/cumulative/electrical/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const records = await Electrical.find({ date: { $lte: date } });
    const cumulativeData = {
      TOP_APRON: { type: "", lifeInDays: 0, lifeInMonths: 0, nextSchedule: "" },
      MIDDLE_APRON: { type: "", lifeInDays: 0, lifeInMonths: 0, nextSchedule: "" },
      BOTTOM_APRON: { type: "", lifeInDays: 0, lifeInMonths: 0, nextSchedule: "" },
    };
    records.forEach((record) => {
      Object.keys(cumulativeData).forEach((section) => {
        const data = record.sections[section];
        if (data) {
          cumulativeData[section].lifeInDays += data.lifeInDays || 0;
          cumulativeData[section].lifeInMonths += data.lifeInMonths || 0;
          cumulativeData[section].nextSchedule = data.nextSchedule || cumulativeData[section].nextSchedule;
          cumulativeData[section].type = data.type || cumulativeData[section].type;
        }
      });
    });
    res.json(cumulativeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));