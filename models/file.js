const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FileSchema = new Schema({
 
  userName:String,
  name: String,
  url: String,
  dateCreated: Date,
  tags: String,
  size: Number,
  icon: String,
  delete: Boolean,
  deleteToArchiv:{
    type:Date
  },
  notes: [{}],
  sharedUsers: [
    {
      type: String,
      match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
  ],
});
// FileSchema.index({deleteToArchiv: 1},{expireAfterSeconds: 2593440});
module.exports = mongoose.model("files", FileSchema);
