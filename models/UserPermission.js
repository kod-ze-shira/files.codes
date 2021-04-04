const mongoose = require("mongoose");

const permissionsEnum = ["public", "private", "admin", "none"];

const permissionSchema = mongoose.Schema({
    sharedEmail: { type: String, require: true, match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ },
    applicationName: String,
    objectId: String,
    permission: { type: String, enum: permissionsEnum, default: "none" },
    ownerUid: { type: String, require: true },
    json: { type: String }//optional field
})
module.exports = mongoose.model("UserPermission", permissionSchema);