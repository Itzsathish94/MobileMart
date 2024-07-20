const mongoose = require("mongoose");
////MobileMart is the data base name
const dbconnect = mongoose.connect(process.env.MONGODB);

dbconnect
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err.message));
