const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const port = process.env.PORT || 5000;
const frontend_key = process.env.FRONTEND_KEY;

app.use(
  cors({
    origin: frontend_key,
  })
);
app.use(express.json());
require("dotenv").config();
const mongoDbKey = process.env.MONGODB_KEY;
mongoose.connect(mongoDbKey);

cloudinary.config({
  cloud_name: "dcdynkm5d",
  api_key: "157745433978489",
  api_secret: "AqvKiU623z4vCZStGiBvBgk-2vQ",
});

const personalSchema = mongoose.Schema({
  profilePic: String,
  name: String,
  about: String,
});
const personalModel = mongoose.model("personal", personalSchema);

const contactSchema = mongoose.Schema({
  contactName: String,
  contactLink: String,
});
const contactModel = mongoose.model("contact", contactSchema);

const firstProjectSectionSchema = mongoose.Schema({
  image: String,
  about: String,
  title: String,
  link: String,
});
const firstProjectSectionModel = mongoose.model(
  "firstProjectSection",
  firstProjectSectionSchema
);

const secondProjectSectionSchema = mongoose.Schema({
  title: String,
  link: String,
});
const secondProjectSectionModel = mongoose.model(
  "secondProjectSection",
  secondProjectSectionSchema
);

const thirdProjectSectionSchema = mongoose.Schema({
  title: String,
  link: String,
});
const thirdProjectSectionModel = mongoose.model(
  "thirdProjectSection",
  thirdProjectSectionSchema
);

const skillSchema = mongoose.Schema({
  skillName: String,
});
const skillModel = mongoose.model("skill", skillSchema);

const educationSchema = mongoose.Schema({
  educationName: String,
  educationAbout: String,
});
const educationModel = mongoose.model("education", educationSchema);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    format: (req, res) => "png",
  },
});

const upload = multer({
  storage: storage,
});

app.post("/profile", upload.single("image"), async (req, res) => {
  const name = req.body.name;
  const about = req.body.about;
  const imagePath = req.file.path;
  const imageSecureUrl = await cloudinary.uploader.upload(imagePath);

  const personalDataCheck = await personalModel.find();
  if (personalDataCheck.length == 0) {
    await personalModel({
      name,
      about,
      profilePic: imageSecureUrl.secure_url,
    }).save();
  } else {
    await personalModel.updateOne(
      {},
      { $set: { name, about, profilePic: imageSecureUrl.secure_url } }
    );
  }
  res.json({ message: "Post received" });
});

app.get("/profile", async (req, res) => {
  let personalData = await personalModel.findOne();
  res.json({ personalData });
});

// __________________________________________________
app.post("/contact", upload.single(), async (req, res) => {
  const contactName = req.body.contactName;
  const contactLink = req.body.contactLink;

  let contactAck = await contactModel({
    contactName,
    contactLink,
  }).save();
  res.json({ message: contactAck });
});

app.get("/contact", async (req, res) => {
  let contactData = await contactModel.find();
  res.json({ contactData });
});

// __________________________________________________
app.post("/skill", upload.single(), async (req, res) => {
  const skillName = req.body.skillName;

  let skillAck = await skillModel({
    skillName,
  }).save();

  res.json({ message: skillAck });
});

app.get("/skill", async (req, res) => {
  let skillData = await skillModel.find();
  res.json({ skillData });
});

// __________________________________________________
app.post("/education", upload.single(), async (req, res) => {
  const educationName = req.body.educationName;
  const educationAbout = req.body.educationAbout;

  let educationAck = await educationModel({
    educationName,
    educationAbout,
  }).save();

  res.json({ message: educationAck });
});

app.get("/education", async (req, res) => {
  let educationData = await educationModel.find();
  res.json({ educationData });
});

// __________________________________________________
app.post(
  "/firstSectionProject",
  upload.single("projectImage"),
  async (req, res) => {
    const image = req.file.path;
    const title = req.body.projectTitle;
    const about = req.body.projectAbout;
    const link = req.body.projectLink;

    let imageSecureUrl = await cloudinary.uploader.upload(image);

    let projectAck = await firstProjectSectionModel({
      image: imageSecureUrl.secure_url,
      title,
      about,
      link,
    }).save();

    res.json({ message: projectAck });
  }
);

app.get("/firstSectionProject", async (req, res) => {
  let projectData = await firstProjectSectionModel.find();

  res.json({ projectData });
});

// __________________________________________________
app.post("/secondSectionProject", upload.single(), async (req, res) => {
  const title = req.body.projectTitle;
  const link = req.body.projectLink;

  let projectAck = await secondProjectSectionModel({
    title,
    link,
  }).save();

  res.json({ message: projectAck });
});

app.get("/secondSectionProject", async (req, res) => {
  let projectData = await secondProjectSectionModel.find();
  res.json({ projectData });
});

// __________________________________________________
app.post("/thirdSectionProject", upload.single(), async (req, res) => {
  const title = req.body.projectTitle;
  const link = req.body.projectLink;

  let projectAck = await thirdProjectSectionModel({
    title,
    link,
  }).save();

  res.json({ message: projectAck });
});

app.get("/thirdSectionProject", async (req, res) => {
  let projectData = await thirdProjectSectionModel.find();
  res.json({ projectData });
});

app.get("/about", async (req, res) => {
  const personalData = await personalModel.findOne();
  const aboutData = personalData;
  res.json({ aboutData });
});

app.get("/updatOrDelete/:section/:part", async (req, res) => {
  let { section } = req.params;
  let { part } = req.params;
  let UpdateAndDeleteArray = await eval(section + "Model").find();
  let UpdateAndDeleteData = UpdateAndDeleteArray.map((item) => item[part]);
  res.json({ dataObj: UpdateAndDeleteData });
});

app.delete("/delete/:section/:part/:specificPart", async (req, res) => {
  const { section } = req.params;
  const { part } = req.params;
  let { specificPart } = req.params;

  if (part === "profilePic" || part === "image") {
    specificPart = specificPart.replaceAll("*", "/");
  }
  const deleteArray = await eval(section + "Model").deleteOne({
    [part]: specificPart,
  });

  console.log("deleteData", specificPart);
  res.json({ dataObj: deleteArray });
});

app.post(
  "/update/:section/:part/:specificPart",
  upload.single("updateData"),
  async (req, res) => {
    const { section } = req.params;
    const { part } = req.params;
    let { specificPart } = req.params;

    if (part === "profilePic" || part === "image") {
      specificPart = specificPart.replaceAll("*", "/");
      var updateData = req.file.path;
      console.log("path", updateData);
    } else {
      var { updateData } = req.body;
    }

    const updateArray = await eval(section + "Model").updateOne(
      { [part]: specificPart },
      { $set: { [part]: updateData } }
    );
    res.json({ message: updateArray });
  }
);

app.listen(port, () => {
  console.log("ok");
});
