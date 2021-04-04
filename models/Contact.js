const mongoose = require('mongoose')

const contactSchema = mongoose.Schema({
    name: { type: String },
    email: {
        type: String, require: true, unique: true,
        match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    phone: {
        type: String,
      //  required: true,
        match: /\d{10}/,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    thumbnail: String,
    numOfUnReadedWaves: Number,
    status: String,
    sourceUrl:String, 
    conversations: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
    ],
    leadOwner:String,
    leadSource:String,
    customerType:String,
    companySize:String,
    companyName:String,
    gender:String,
    createDateAndTime:{ type: Date, default: Date.now },
    bestTimeToCall:Date,
    birthday:Date ,
    telephon:String,
    mobileNumber:String,
    companyAddress:String,
    state:String,
    zipcode:String,
    website:String , 
    whatsapp:String ,
    linkedIn:String,
    facebook:String,
    instagram:String,
    youTube:String ,
    source: [s = mongoose.Schema({
        id: { type: mongoose.Schema.Types.ObjectId },
        type: String
    })],
    unSubscribe:{ type: Boolean, default: false }
})

module.exports = mongoose.model('Contact', contactSchema)

