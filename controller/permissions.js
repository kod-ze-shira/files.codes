const UserPermission = require("../models/UserPermission");
const User = require("../models/User");
const Contact = require("../models/Contact");
const request = require('request')
const path = require("path");


module.exports = {

    createPermission: async (req, res) => {
        console.log("in createPermission ");
        const { sharedEmail, applicationName, permission, objectId } = req.body;
        const uId = req.params.uId;
        let currentUser=await User.findOne({ uid: uId });
        var type;
        UserPermission.findOne({ objectId: objectId, sharedEmail: sharedEmail, ownerUid: uId }, async function (err, data) {//check if this permission allready exist
            if (err) {
                res.send(err);
            }
            if (data == null) {//create permission
                console.log("create permission") 
                try {
                    var newPermission = new UserPermission({
                        sharedEmail: sharedEmail,
                        applicationName: applicationName,
                        objectId: objectId,
                        permission: permission.toLowerCase(),
                        ownerUid: uId
                    });
                    if (req.body.json) {//if send json
                        console.log("json");
                        newPermission.json = req.body.json;
                    }
                    await newPermission.save(async function (err) {
                        console.log(err)
                        if (err) res.status(400).json({
                            message: err
                        });
                        else {
                            await addContact(req);//add the shared user to be contact (if not exist)
                            let sharedUser = await User.findOne({ email: sharedEmail });
                            if (!sharedUser)//if the shared user doesn't have leader account
                                type = "newAndCreateAccount";
                            else
                                type = "new";
                            let contact = await Contact.findOne({user:currentUser._id, email: sharedEmail });
                            // if(contact.unSubscribe==false)//make sure that this contact don't unsubscribe
                                await sendMessage(req, type).then(() => {
                                    res.status(200).json({
                                        message: "save in db and send email"
                                    });
                                })
                            // else
                            //     res.status(200).json({
                            //         message: "unsubscribe contact! only save in db"
                            //     });
                        }
                    });
                } catch (err) {
                    console.log(err);
                    res.send(err);
                }
            }
            else {//update permission
                data.permission = permission.toLowerCase();
                data.save();
                type = "update";
                let contact = await Contact.findOne({user:currentUser._id, email: sharedEmail });
                // if(contact.unSubscribe==false)//make sure that this contact don't unsubscribe
                   await sendMessage(req, type).then(() => {
                       res.status(200).json({
                           message: "updated and send email"
                       });
                   })
                // else
                //     res.status(200).json({
                //         message: "unsubscribe contact! only updated"
                //     });
            }
        });


    },

    checkObjectPermission: async (req, res) => {
        console.log("in checkPermission!!!!!!!!!! ");
        let { sharedEmail, objectId, ownerUid } = req.body;
        if (sharedEmail.includes("@") != true)//if send uid and not email
        {
            console.log("findByUId");
            console.log("," + sharedEmail + ",");
            let currentUser = await User.findOne({ uid: sharedEmail });
            sharedEmail = currentUser.email;
        }
        UserPermission.findOne({ objectId: objectId, sharedEmail: sharedEmail, ownerUid: ownerUid }, function (err, data) {
            if (err) {
                res.send(err);
            }
            if (data == null) {
                res.status(200).json({
                    "permission": "none"
                })
            }
            else {
                const permission = data.permission;
                res.status(200).send({
                    permission
                });
            }
        });
    },

    getAllUserPermissions: async (req, res) => {//get all permissions for user for specific application
        console.log("in getAllUserPermissions!!!!!!!!!! ");
        const applicationName = req.params.applicationName;
        let currentUser = await User.findOne({ uid: req.params.uId });
        console.log(currentUser)
        UserPermission.find({ sharedEmail: currentUser.email, applicationName: applicationName }, function (err, data) {
            if (err) {
                res.send(err);
            }
            res.send(data);
        });
    },

    deletePermission: async (req, res)=>{//delete permission by objectId
        UserPermission.deleteOne({_id:req.params.id},function(err,data) {
            if (!err) {
                console.log("permission deleted");
                res.status(200).json({Message:"permission deleted"});
            }
            else {
                console.log(err);
                res.status(500).json(err);
            }
        });
    },

    deletePermissionByObjectId: async (req, res)=>{//delete permission by objectId
        const objectId=req.params.objectId;
        UserPermission.deleteMany({objectId:objectId},function(err,data) {
            if (!err) {
                console.log("deleted "+data.deletedCount+" permissions");
                res.status(200).json({Message:"deleted "+data.deletedCount+" permissions"});
            }
            else {
                console.log(err);
                res.status(500).json(err);
            }
        });
    },
    //פונקציות שצריך למחוק אחרי שמעלים אותם לשרת המאסטר
    // unSubscribe : async (req,res) => {

    //     console.log("arrive to unSubscribe");
    //     let currentUser = await User.findOne({ uid: req.params.uId });
    //     Contact.findOneAndUpdate({email:req.params.email,user:currentUser._id},{ $set: {unSubscribe:true} },
    //     (err, results) => {
    //       if (err) res.send(err);
    //       else {
    //           console.log(results)
    //           res.sendFile(path.join(__dirname, "../views/unSubscribeSuccess.html"));
    //         };
    //     }); 
        
    // },
    // unSubscribeAsking : async (req, res) => {
    //     console.log("inside view unSubscribeAsking");//edit post
    //     res.sendFile(path.join(__dirname, "../views/unSubscribeAsking.html"));
    // },
    askForPermission: async (req, res) => {//פונקציה לא עובדת, כרגע לא צריך אותה
        const { sharedEmail, applicationName, permission, objectId } = req.body;
        var subject;
        var body;
        subject = sharedEmail + " want to accept " + permission + " permission to this " + applicationName;
        body = `<body>
        if you want to let him this permission please click here <br/>
        onClick=(function(){
            $.ajax({
                type: "POST",
                url:
                  "https://files.leader.codes/api/" +
                 ${req.params.uId} +
                  "/createPermission",
                headers: { Authorization: ${req.headers.jwt} },
                data: JSON.stringify({
                  applicationName:${applicationName},
                  sharedEmail:${sharedEmail},
                  objectId: ${objectId},
                  permission: ${permission},
                }),
                dataType: "json",
                contentType: "application/json",
                success: function (data) {}
            })
        })<button type="button">Click Me!</button>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <body/>`;
        let currentUser = await User.findOne({ uid: req.params.uId });
        await sendEmail(subject, body, currentUser.email).then(() => {
            res.status(200).json({
                message: "send ask email"
            });
        })
    }
}

sendMessage = async (req, type) => {
    console.log("send massage type", type);
    let { sharedEmail, applicationName, permission, objectId } = req.body;
    const uId = req.params.uId;
    const ownerUser = await User.findOne({ uid: uId });
    let url;
    let unsubscribeUrl="https://leader.codes/api/"+uId+"/"+sharedEmail+"/unSubscribeAsking";//here need to add the unsubscribe url
    if (req.body.json) {
        console.log('send json')
        url = "https://" + applicationName + ".leader.codes/" + sharedEmail + "/" + objectId + "/" + uId + "/" + req.body.json + "/share";
    }
    if(permission=="private"){
        console.log('private')
        url = "https://" + applicationName + ".leader.codes/" + sharedEmail + "/" + objectId + "/" + uId + "/share"
    }
    if(permission=="public"){
    console.log('public')
        url = "https://" + applicationName + ".leader.codes/" + sharedEmail + "/" + objectId + "/" + uId + "/PublicShare";}
    // applicationName = applicationName.substring(0, applicationName.length - 1);
    var subject;
    var body;
    var name;
    if (applicationName == 'hub')
        name = "project";
    else
        name = applicationName;
        console.log(url)
    body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta content="telephone=no" name="format-detection" />
        <title></title>
        <style type="text/css" data-premailer="ignore">
            @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700);
        </style>
        <style data-premailer="ignore">
            @media screen and (max-width: 600px) {
                u+.body {
                    width: 100vw !important;
                }
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
        </style>
        <!--[if mso]>
          <style type="text/css">
            body, table, td {
                font-family: Arial, Helvetica, sans-serif !important;
            }
            
            img {
                -ms-interpolation-mode: bicubic;
            }
            
            .box {
                border-color: #eee !important;
            }
          </style>
        <![endif]-->
    
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #f5f7fb;
                font-size: 15px;
                line-height: 160%;
                mso-line-height-rule: exactly;
                color: #444444;
                width: 100%;
            }
    
            body {
                font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
            }
    
            img {
                border: 0 none;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                vertical-align: baseline;
                font-size: 0;
            }
    
            a:hover {
                text-decoration: underline;
            }
    
            .btn:hover {
                text-decoration: none;
            }
    
            .btn.bg-bordered:hover {
                background-color: #f9fbfe !important;
            }
    
            a.bg-blue:hover {
                background-color: #3a77cc !important;
            }
    
            a.bg-azure:hover {
                background-color: #37a3f1 !important;
            }
    
            a.bg-indigo:hover {
                background-color: #596ac9 !important;
            }
    
            a.bg-purple:hover {
                background-color: #9d50e8 !important;
            }
    
            a.bg-pink:hover {
                background-color: #f55f91 !important;
            }
    
            a.bg-red:hover {
                background-color: #c01e1d !important;
            }
    
            a.bg-orange:hover {
                background-color: #fd8e35 !important;
            }
    
            a.bg-yellow:hover {
                background-color: #e3b90d !important;
            }
    
            a.bg-lime:hover {
                background-color: #73cb2d !important;
            }
    
            a.bg-green:hover {
                background-color: #56ab00 !important;
            }
    
            a.bg-teal:hover {
                background-color: #28beae !important;
            }
    
            a.bg-cyan:hover {
                background-color: #1596aa !important;
            }
    
            a.bg-gray:hover {
                background-color: #95a9b0 !important;
            }
    
            a.bg-secondary:hover {
                background-color: #ecf0f2 !important;
            }
    
            .img-hover:hover img {
                opacity: .64;
            }
    
            @media only screen and (max-width: 560px) {
                body {
                    font-size: 14px !important;
                }
    
                .content {
                    padding: 24px !important;
                }
    
                .content-image-text {
                    padding: 24px !important;
                }
    
                .content-image {
                    height: 100px !important;
                }
    
                .content-image-text {
                    padding-top: 96px !important;
                }
    
                h1 {
                    font-size: 24px !important;
                }
    
                .h1 {
                    font-size: 24px !important;
                }
    
                h2 {
                    font-size: 20px !important;
                }
    
                .h2 {
                    font-size: 20px !important;
                }
    
                h3 {
                    font-size: 18px !important;
                }
    
                .h3 {
                    font-size: 18px !important;
                }
    
                .col {
                    display: table !important;
                    width: 100% !important;
                }
    
                .col-spacer {
                    display: table !important;
                    width: 100% !important;
                }
    
                .col-spacer-xs {
                    display: table !important;
                    width: 100% !important;
                }
    
                .col-spacer-sm {
                    display: table !important;
                    width: 100% !important;
                }
    
                .col-hr {
                    display: table !important;
                    width: 100% !important;
                }
    
                .row {
                    display: table !important;
                    width: 100% !important;
                }
    
                .col-hr {
                    border: 0 !important;
                    height: 24px !important;
                    width: auto !important;
                    background: transparent !important;
                }
    
                .col-spacer {
                    width: 100% !important;
                    height: 24px !important;
                }
    
                .col-spacer-sm {
                    height: 16px !important;
                }
    
                .col-spacer-xs {
                    height: 8px !important;
                }
    
                .chart-cell-spacer {
                    width: 4px !important;
                }
    
                .text-mobile-center {
                    text-align: center !important;
                }
    
                .d-mobile-none {
                    display: none !important;
                }
            }
        </style>
    </head>
    
    <body class="bg-body" style="font-size: 15px; margin: 0; padding: 0; line-height: 160%; mso-line-height-rule: exactly; color: #444444; width: 100%; font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;" bgcolor="#f5f7fb">
        <center>
            <table class="main bg-body" width="100%" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;" bgcolor="#f5f7fb">
                <tr>
                    <td align="center" valign="top" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                        <!--[if (gte mso 9)|(IE)]>
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" valign="top" width="640">
                <![endif]-->
                        <!--<span class="preheader" style="font-size: 0; padding: 0; display: none; max-height: 0; mso-hide: all; line-height: 0; color: transparent; height: 0; max-width: 0; opacity: 0; overflow: hidden; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span>-->
                        <table class="wrap" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%; max-width: 640px; text-align: left;">
                            <tr>
                                <td class="p-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding: 8px;">
                                    <table cellpadding="0" cellspacing="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%;">
                                        <tr>
                                            <td class="py-lg" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-top: 24px; padding-bottom: 24px;">
                                                <table cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%;">
                                                    <tr>
                                                        <td style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                            <a href="" style="color: #467fcf; text-decoration: none;"><img src="https://forms.leader.codes/image/Group19050.png" height="34" alt="" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: baseline; font-size: 0; border: 0 none;" /></a>
                                                        </td>
                                                        <!--<td class="text-right" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;" align="right">
                                                            <a href="" class="text-muted-light font-sm" style="color: #bbc8cd; text-decoration: none; font-size: 13px;">
                                                                View online
                                                            </a>
                                                        </td>-->
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <div class="main-content">
                                        <table class="box" cellpadding="0" cellspacing="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%; border-radius: 3px; -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); border: 1px solid #f0f0f0;" bgcolor="#ffffff">
                                            <tr>
                                                <td style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                    <table cellpadding="0" cellspacing="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%;">
                                                        <tr>
                                                            <td class="content" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding: 40px 48px;">
                                                               <!-- <table class="mb-lg" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%; margin-bottom: 24px;">
                                                                    <tr>
                                                                        <td class="w-50p" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; width: 50%;">
                                                                        </td>
                                                                        <td style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                                            <img src="./assets/sample-user-codecalm.jpg" class=" avatar avatar-rounded " width="56" height="56" alt="" style="line-height: 100%; border: 0 none; outline: none; text-decoration: none; vertical-align: baseline; font-size: 0; border-radius: 3px; -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);" />
                                                                        </td>
                                                                        <td style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                                            <table class="icon icon-md bg-none" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding: 0; border-collapse: separate; width: 54px; border-radius: 50%; line-height: 100%; font-weight: 300; height: 54px; font-size: 32px; text-align: center;" bgcolor="transparent">
                                                                                <tr>
                                                                                    <td align="center" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                                                        <img src="./assets/icons-black-plus.png" class=" va-middle" width="32" height="32" alt="plus" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; display: block; border: 0 none;" />
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                        <td style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                                            <img src="./assets/sample-user-mrszympek.jpg" class=" avatar avatar-rounded " width="56" height="56" alt="" style="line-height: 100%; border: 0 none; outline: none; text-decoration: none; vertical-align: baseline; font-size: 0; border-radius: 3px; -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);" />
                                                                        </td>
                                                                        <td class="w-50p" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; width: 50%;"> </td>
                                                                    </tr>
                                                                </table>-->
                                                                <h2 class="text-center m-0" style="font-weight: 300; font-size: 24px; line-height: 130%; margin: 0;" align="center">
                                                                    `+ ownerUser.username + ` has invited you to collaborate this
                                                                    <strong style="font-weight: 600;">`+ name + `</strong>
                                                                </h2>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="content pt-0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding: 0 48px 40px;">
                                                                You can <a href=`+ url + ` style="color: #467fcf; text-decoration: none;">accept or decline</a> this invitation. You can also visit <a href="" style="color: #467fcf; text-decoration: none;">@Leader</a> to learn a bit more about them.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="content pt-0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding: 0 48px 40px;">
                                                                <table cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%;">
                                                                    <tr>
                                                                        <td align="center" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;">
                                                                            <table cellpadding="0" cellspacing="0" border="0" class="bg-blue rounded w-auto" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: separate; width: auto; color: #ffffff; border-radius: 3px;" bgcolor="#467fcf">
                                                                                <tr>
                                                                                    <td align="center" valign="top" class="lh-1" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; line-height: 100%;">
                                                                                        <a href=`+ url + ` class="btn bg-blue border-blue" style="color: #ffffff; padding: 12px 32px; border: 1px solid #467fcf; text-decoration: none; white-space: nowrap; font-weight: 600; font-size: 16px; border-radius: 3px; line-height: 100%; display: block; -webkit-transition: .3s background-color; transition: .3s background-color; background-color: #467fcf;">
                                                                                            <span class="btn-span" style="color: #ffffff; font-size: 16px; text-decoration: none; white-space: nowrap; font-weight: 600; line-height: 100%;">View invitation</span>
                                                                                        </a>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="content border-top font-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 13px; border-top-width: 1px; border-top-color: #f0f0f0; border-top-style: solid; padding: 40px 48px;">
                                                                <p style="margin: 0 0 1em;">
                                                                    <strong style="font-weight: 600;">Note:</strong> This invitation was intended for <a href="" style="color: #467fcf; text-decoration: none;">support@leader.io</a>. If you were not expecting this invitation, you can ignore this email. If `+ ownerUser.username + ` is sending you too many emails, you can <a href="" style="color: #467fcf; text-decoration: none;">report abuse</a>.
                                                                </p>
                                                                <p class="text-muted" style="color: #9eb0b7; margin: 0 0 1em;">
                                                                    Getting a 404 error? Make sure you’re signed in as @mrszympek.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <table cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%;">
                                        <tr>
                                            <td class="py-xl" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-top: 48px; padding-bottom: 48px;">
                                                <table class="font-sm text-center text-muted" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: 100%; color: #9eb0b7; text-align: center; font-size: 13px;">
                                                    <tr>
                                                        <td align="center" class="pb-md" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-bottom: 16px;">
                                                            <table class="w-auto" cellspacing="0" cellpadding="0" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; border-collapse: collapse; width: auto;">
                                                                <tr>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-facebook-square.png" class=" va-middle" width="24" height="24" alt="social-facebook-square" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-twitter.png" class=" va-middle" width="24" height="24" alt="social-twitter" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-github.png" class=" va-middle" width="24" height="24" alt="social-github" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-youtube.png" class=" va-middle" width="24" height="24" alt="social-youtube" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-pinterest.png" class=" va-middle" width="24" height="24" alt="social-pinterest" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                    <td class="px-sm" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 8px; padding-left: 8px;">
                                                                        <a href="" style="color: #467fcf; text-decoration: none;">
                                                                            <img src="https://files.leader.codes/views/img/icons-gray-social-instagram.png" class=" va-middle" width="24" height="24" alt="social-instagram" style="line-height: 100%; outline: none; text-decoration: none; vertical-align: middle; font-size: 0; border: 0 none;" />
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="px-lg" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-right: 24px; padding-left: 24px;">
                                                            If you have any questions, feel free to message us at <a href="mailto:support@leader.io" class="text-muted" style="color: #9eb0b7; text-decoration: none;">support@leader.io</a>.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="pt-md" style="font-family: Open Sans, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif; padding-top: 16px;">
                                                            You are receiving this email because a Leader user shared this ${name} with you. <a href=${unsubscribeUrl} class="text-muted" style="color: #9eb0b7; text-decoration: none;">Unsubscribe</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                </td>
              </tr>
            </table>
                <![endif]-->
                    </td>
                </tr>
            </table>
        </center>
    </body>
    
    </html>`
    if (type == "new") {
        subject = "Hi friend" + " - " + ownerUser.username + " shared the following " + name + " with you";
    }
    else if (type == "newAndCreateAccount") {//יש לצרף הזמנה לפתיחת חשבון
        subject = "Hi friend" + " - " + ownerUser.username + " shared the following " + name + " with you";
        // body = "Hi friend we see you don't have leader account,<br/> to see what you shared first create an account,<br/> please enter this link " + url;
    }
    else //updated
    {
        subject = "Hi friend" + " - " + ownerUser.username + " updated your permission for this " + name;
    }
    await submitToLeaderBox(req, subject, body);
    await sendEmail(subject, body, sharedEmail,ownerUser.username );

}

submitToLeaderBox = async (req, subject, body) => {//send to leader box if the shared user is leader user

    let sharedUser = await User.findOne({ email: req.body.sharedEmail });
    if (sharedUser) {
        console.log("submitToLeaderBox");
        let conversation = { source: req.body.applicationName, subject: subject };
        let wave = { body: body }
        const options = {
            url: ` https://box.leader.codes/api/${sharedUser.uid}/conversation/saveConversationGlobal`,
            method: "POST",
            json: { conversation, wave }
        };
        console.log("122222222222");
        return new Promise((resolve, reject) => {
            request(options, (error, res, body) => {
                if (error) {
                    console.log("error:" + error);
                    reject(error);
                }
                console.log(`statusCode: ${res.statusCode}`);
                resolve('sent');
            });
        });
    }
}


// sendEmail = async (subject, body, emailTo,username) => {//send email to the shared user
    
//     console.log("arrive to sendEmail");
//     var email = {}
//     email = {
//         to: emailTo,
//         from: `${username}@mail.leader.codes`,
//         subject: subject,
//         html: body
//     }
//     const options = {
//         url: 'https://api.leader.codes/mail/sendEmail',
//         method: 'POST',
//         headers: { Authorization: "view" },
//         json: email,
//     };
//     return new Promise((resolve, reject) => {
//         request(options, (error, res, body) => {
//             if (error) {
//                 console.error("error:" + error);
//                 reject(error);
//             }
//             console.log(`statusCode: ${res.statusCode}`);
//             console.log(body);
//             resolve('sent')
//         });
//     });

// }


sendEmail = async (subject, body, emailTo, username) => {//send email to the shared user
 
    const email = {
      from: `${username}@mails.codes`,
      to: emailTo,//"aaa@gmail.com"
      subject: subject,
      html: body
    }
    const options = {
      url: 'https://mails.codes/mail/sendEmail',
      method: 'POST',
      headers: { Authorization: "secretKEY@2021"},
      json: email,
    };
    return new Promise((resolve, reject) => {
      request(options, (error, res, body) => {
        if (error) {
          console.error("error:" + error);
          reject(error);
        }
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
        resolve( 'sent' )
      });
    });
   
  }
  

addContact = async (req) => {//send email to the shared user
    return new Promise((resolve, reject) => {
    console.log("arrive to addContact");
    let contact = {};
    let type=req.body.applicationName;
    console.log(type);
    type= type[0].toUpperCase() + type.slice(1);
    console.log(type);
    contact = {
        email: req.body.sharedEmail,
    }
    let source = {};
    source = {
        id: req.body.objectId,
        type: type
    }
    const options = {
        url: `https://box.leader.codes/api/${req.params.uId}/contact/newContact`,
        method: 'POST',
        headers: { Authentication: req.headers.jwt },
        json: { contact, source }
    };
    
        request(options, (error, res, body) => {
            if (error) {
                console.error("error:" + error);
                reject(error);
            }
            console.log(`statusCode: ${res.statusCode}`);
            console.log(body);
            resolve('add contact')
        });
    });
}

