const User = require("../models/User.js");
const fileModel = require("../models/file.js");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const request = require("request");
const UserPermission = require("../models/UserPermission");
let filesData = [];

getUidByUserName = async (req, res) => {
    console.log("inside!!");
    const userName = req.params.userName;
    console.log(userName);
    const user = await User.findOne({ username: userName });
    if (user) res.json({ uid: user.uid });
};

viewFileShared = async (req, res) => {
    console.log("in view shared");
    const { sharedEmail, fileId, ownerUid } = req.params;
    let currentUser = await User.findOne({ email: req.params.sharedEmail });
    console.log("currentUser", currentUser)
    if (!currentUser || currentUser.email != sharedEmail){
        console.log("currentUser if 1",currentUser.uid, currentUser.email)

    
        res.sendFile(path.join(__dirname, "../views/none.html"));}
    else{
        UserPermission.findOne(
            { objectId: fileId, sharedEmail: sharedEmail, ownerUid: ownerUid },
            function (err, data) {
                if (err) {
                    console.log('err',err)
                    res.send(err);
                }
                if (data == null) {
                    console.log("1 if 2 " , data)
                    res.sendFile(path.join(__dirname, "../views/none.html"));
                } else {
                    console.log("2 if 2 " , data)

                    res.sendFile(path.join(__dirname, "../views/shareFile.html"));
                }
            }
        );}
};
viewPublicFileShared=(req,res)=>{
    console.log('viewPublicFileShared')
    const fileId = req.params.fileId;
    console.log(fileId);
    fileModel.find({ uId: req.params.ownerUid }, function (err, files) {
        if (err) {
            res.send(err);
        }
        const filteredFiles = files.filter((file) => file._id == fileId);
        const data = filteredFiles[0].url ;

        console.log('data',data)
        res.redirect(data)
    });


}
viewFileDetails = (req, res) => {
    console.log("details");
    res.sendFile(path.join(__dirname, "../views/files-details.html"));
};

viewFiles = (req, res) => {
    console.log("files");
    console.log(path.join(__dirname, "../views/files.html"));
    res.sendFile(path.join(__dirname, "../views/files.html"));
};
/* GET files listing. */
getAllFiles = async (req, res) => {
    // const aa = await checkPermission(req, res);
    console.log("in getAll");
    console.log(req.params);
    fileModel.find({userName: req.params.userName }, function (err, data) {
        if (err) {
            res.send(err);
        }
        const filteredFiles = data.filter((file) => file.delete == false);
        // var mydata = JSON.stringify(data);
        res.send(filteredFiles);
    });
};
findSaredUsers=(req,res)=>{
console.log("findSaredUsers")
const shareUser = req.params.email
User.find({ email: shareUser }, function (err, data) {
    if (err) {
        res.send(err);
    }

   console.log(data[0].uid)
   res.send(data[0].uid);
})
}

getSharedFiles = async (req, res) => {
    console.log("in view shared");
    let currentUser = await User.findOne({ userName: req.params.userName });
    fileModel.find({}, function (err, files) {
        if (err) {
            res.send(err);
        }
        if(currentUser){
            console.log(currentUser)
        const filteredFiles = files.filter((file) =>
            file.sharedUsers.includes(currentUser.email)
        );
        const myData = JSON.stringify(filteredFiles);
        console.log(myData);
       (myData);}
        else{ res.send({massage:"not found"})}
    });
};
// deleteFile = (req, res) => {
//   fileModel.findOneAndDelete({ _id: req.body.fileId }, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("file Deleted!!");
//     }
//   });
// };

findByTag = (req, res) => {
    console.log('in findByTag')
    const tag = req.params[0];
    console.log(req.params[0]);

  

    fileModel.find({userName: req.params.userName }, function (err, files) {
        if (err) {
            return res.status(500).json(err);
        }
        else {
            if(files){
                
            console.log(files) 
            const filteredFiles = files.filter((file) =>file.tags!=null&&file.delete==false&&file.tags&&file.tags.includes(tag));
            // const myData = JSON.stringify(filteredFiles);
            console.log(filteredFiles)
            return res.status(200).json(filteredFiles);}
        }
    });
};
updateTag = (req, res) => {
    console.log('in updateTag')
    const tag = req.body.tag;
    const files = req.body.files
    fileModel.updateMany({
        _id: { $in: files }
    }, { $set: { tags: tag } })
        .then((result) => {
            console.log("file's tags update");

            res.status(200).json({
                message: "file's tags update",
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                error,
            });
        });





}
findById = (req, res) => {
    const fileId = req.body.fileId;
    console.log("in byId", fileId);
    fileModel.find({ userName: req.params.userName }, function (err, files) {
        if (err) {
            res.send(err);
        }
        const filteredFiles = files.filter((file) => file._id == fileId);
        const data = filteredFiles;
        res.send(data);
    });
};

findShareById = (req, res) => {
    const fileId = req.body.fileId;
    console.log("in byId", fileId);
    fileModel.find({ userName: req.params.ownerUserName }, function (err, files) {
        if (err) {
            res.send(err);
        }
        const filteredFiles = files.filter((file) => file._id == fileId);
        const data = filteredFiles;
        res.send(data);
    });
};

download = (req, res) => {
    console.log(req.params[0]);
    console.log("download");
    var file;
    let f = req.params[0].replace("https://files.codes/uploads", "");
    console.log(f);
    file = path.join(__dirname, "../uploads/", f);//download by name
    res.download(file);
};

remove = (req, res) => {
    console.log(req.params[0]);
    console.log("remove");
    var file;
    let url = req.params[0].replace("https://files.codes/uploads", "");
    console.log(url);

    fileModel.findOne({ url: req.params[0] }, async (error, file) => {
        console.log("This object will get deleted " + file);
        if (file) {
            await file.remove();
            url = path.join(__dirname, "../uploads/", url);
            fs.unlink(url, function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        message: "path not exit" + file
                    });
                }
                else res.status(200).json({
                    message: "file removed",
                });
            });
        }
        else {
            res.status(404).json({
                message: "file not found",
            });
        }
    });
};
updateFile = async (req, res) => {
    console.log("updateFile");
    const url = req.params[0];
    const key = Object.keys(req.files)[0];
    const dateNow = Date.now();
    let urlToRemove = req.params[0].replace("https://files.codes/uploads", "");
    urlToRemove = path.join(__dirname, "../uploads/", urlToRemove);
    console.log(urlToRemove);
    const size = await checkOver2GB(req);
    if (size)
        res.status(401).json({
            Message: "this user has over 2 GB",
        });
    else {
        const result = await uploadFileAndSave(req, req.files[key], key, dateNow);
        if (result) {
            fs.unlink(urlToRemove, async (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        message: "path not exit" + urlToRemove
                    });
                }
                else {
                    updateFileDB(req.params[0], req.params.userName, filesData[key]).then((data) => {
                        res.status(200).json({
                            file: data.file,
                        });

                    }).catch((error) => {
                        res.status(500).json({
                            error,
                        });
                    })

                }
            });
        }
    }
}
updateFileDB = (url, userName, file) => {
    const name = file.url.slice(file.url.lastIndexOf('/') + 1, file.url.length)
    const date = new Date(parseInt(name.split("__")[0], 10))
    const size = file.size ? file.size / 1024 / 1024 : 0
    return new Promise((resolve, reject) => {
        fileModel.findOneAndUpdate({ url: url },
            {
                userName: userName,
                name: `${date}__${file.name}`,
                dateCreated: date,
                size: file.size / 1024 / 1024,
                icon: iconsClasses[file.name.slice(file.name.toLowerCase().lastIndexOf(".") + 1, file.name.length)],
                url: file.url
            }, { upsert: true, new: true }, (err, docs) => {
                if (!docs) {
                    reject({ message: "file not exist ", file: docs })
                }
                else {
                    console.log("update File successfully", docs);
                    resolve({ message: "update File successfully", file: docs })
                }
            })
    })

}
// fileToArchiv = (req, res) => {
//     console.log("in fileToArchiv ");
//     const fileId = req.body.fileId;
//     console.log("fileId", fileId);
//     fileModel.findById({ _id: fileId }).then((myfile) => {
//         if (req.params.uId == myfile.uId) {
//             fileModel
//                 .findByIdAndUpdate({ _id: fileId }, { $set: { delete: true,deleteToArchiv:new Date() } })
//                 .then((result) => {
//                     console.log("file in archiv");
//                     res.status(200).json({
//                         message: "file in archiv",
//                     });
//                 })
//                 .catch((error) => {
//                     console.log(error);
//                     res.status(500).json({
//                         error,
//                     });
//                 });
//         } else
//             res.status(401).json({
//                 message: "Unauthorized user",
//             });
//     });
// };



multiFilesToArchiv = (req, res) => {
    console.log('in multiFilesToArchiv')
    const files = req.body.files
    console.log("filesToDelete", files);
    fileModel.updateMany({
        _id: { $in: files }
    }, { $set: { delete: true
        // ,deleteToArchiv:new Date() 
    } })
        .then((result) => {
            console.log("files in archiv");

            res.status(200).json({
                message: ' files in archiv',
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                error,
            });
        });



}


recovereMultiFiles = (req, res) => {
    console.log('in recovereMultiFiles')
    const files = req.body.files
    console.log("filesToRecovered", files);
    fileModel.updateMany({
        _id: { $in: files }
    }, { $set: { delete: false } })
        .then((result) => {
            console.log("files recovered");

            res.status(200).json({
                message: ' files recovered',
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                error,
            });
        });



}

showDeletedFiles = (req, res) => {
    console.log("in deleted");
    fileModel.find({ userName: req.params.userName }, function (err, files) {
        if (err) {
            res.send(err);
        }
        const filteredFiles = files.filter((file) => file.delete == true);
        
        res.send(filteredFiles);
    });
};
saveNotes = (req, res) => {
    console.log("in saveNotes!");
    var note = req.body.notes;
    console.log(note);
    const fileId = req.body.fileId;
    console.log(fileId);
    fileModel
        .findByIdAndUpdate({ _id: fileId }, { $push: { notes: note } }, {upsert: true, new: true},)
        .then((result) => {
            console.log("note save");

            res.status(200).json({
                message: "note save",
                data: result

            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                error,
            });
        });
};
editNotes = (req, res) => {
    console.log("in editNotes!");
    var notes = req.body.notes;
    const fileId = req.body.fileId;
    console.log(fileId);
    fileModel
        .findOneAndUpdate({ _id: fileId},  { $set: { notes: notes } },
        {upsert: true, new: true},(err,file)=>{
            if(err){
                console.log(err);
            res.status(500).json({
                err,
            });
            }

            console.log("note update",file);

                res.status(200).json({
                    message: "note update",
                    data: file
    
                });


        })

};
shareFile = (req, res) => {
    const { fileId, sharedEmail } = req.body;
    fileModel.findById({ _id: fileId }, function (err, file) {
        console.log(file.sharedUsers);
        if (!file.sharedUsers.includes(sharedEmail)) {
            file.sharedUsers.push(sharedEmail);
            file.save();
            res.status(200).json({
                message: "save",
            });
        } else
            res.status(200).json({
                message: "exist",
            });
    });
};

checkOver2GB = (req) => {
    return new Promise(async function (resolve, reject) {
        console.log("incheckOver2GB", req.params.userName);
        fileModel.find({ userName: req.params.userName }, function (err, data) {
            console.log("incheckOver2GB too!!!");
            if (err) {
                console.log(err);
                resolve(true);
            }
            if (data) {
                var count = 0;
                for (let index = 0; index < data.length; index++) {
                    count += data[index].size;
                }
                // data.forEach((element) => {
                //   count += element.size;
                // });
                console.log("count:", count);
                if (count > 2 * 1024) resolve(true);
            }
            resolve(false);
        });

    });
};
viewUploadFile = (req, res) => {
    console.log('in///')
    res.sendFile(path.join(__dirname, "../views/uploadPopApp.html"));
}

upload = async (req, res) => {
    console.log(req.files);
    let size = await checkOver2GB(req);

    console.log(size);
    if (size == true) {
        res.status(401).json({
            Message: "this user has over 2 GB",
        });
        console.log("this user has over 2 GB");
    } else {
        console.log("in upload");
        console.log(req.files);
        console.log("fields:", req.body);
        let subFolder = getTypeFolder(req.files.file.name);
        console.log("typeFolder", subFolder);
        if (!subFolder) {
            res.send({ message: "File type is not support" });
        } else {
            let userName = req.params.userName
            if(!userName||userName=='undefined'||userName==null||userName=="null"){
                console.log("no userName")
                res.send({ message: "no userName" });
            }
            else{

            const dateNow = Date.now();
            const newpath = path.join(
                __dirname,
                "../uploads",
                `${req.params.userName}`,
                `/${subFolder}`,
                `${dateNow}__${req.files.file.name}`
            );

            console.log(newpath);
            let file = req.files.file;
            console.log(file);
           

            const newFile = new fileModel({
               
                userName: req.params.userName,
                name: `${dateNow}__${file.name}`,
                url:
                    "https://files.codes" +
                    path.join(
                        __dirname,
                        "../../uploads",
                        `/${req.params.userName}`,
                        `/${subFolder}`,
                        `${dateNow}__${req.files.file.name}`
                    ),
                dateCreated: dateNow,
                tags: req.body.tags,
                size: file.size / 1024 / 1024,
                icon: iconsClasses[file.name.toLowerCase().slice(file.name.toLowerCase().lastIndexOf(".") + 1, file.name.length)],
                delete: false,
            });
           
            try {
                let result = await newFile.save();
                console.log("save in db", result);
            } catch (err) {
                console.log(err);
                res.send(err);
            }
            file.mv(newpath).then((success) => {
                console.log("success!!!!!!!!!!!!!");
                console.log("file.name ", file.name);
                console.log("file.mimetype ", file.mimetype);
                console.log("file.size ", file.size);
               
                let data = {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size / 1024 / 1024,
                    url:
                        "https://files.codes" +
                        path.join(
                            __dirname,
                            "../../uploads",
                            `/${req.params.userName}`,
                            `/${subFolder}`,
                            `${dateNow}__${req.files.file.name}`
                        ),
                };
                console.log(data);
                res.send({
                    status: true,
                    message: "File is uploaded",
                    data: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size / 1024 / 1024,
                        fileId:newFile._id,
                        url:
                            "https://files.codes" +
                            path.join(
                                __dirname,
                                "../../uploads",
                                `/${req.params.userName}`,
                                `/${subFolder}`,
                                `${dateNow}__${req.files.file.name}`
                            ),
                    },
                });
            });}
        }
        // }
        // })
    }
};

createNewFolder=async(req,res)=>{
    var folder = req.body.tags
    
    console.log("in createNewFolder "+folder)
    const dateNow = Date.now();
    const newFile = new fileModel({
        
        userName:req.params.userName,
        dateCreated: dateNow,
        tags: folder,      
        delete: false,
    });
   
    try {
        let result = await newFile.save();
        console.log("save in db", result);
       res.send({massage:"save in db",data: result});

    } catch (err) {
        console.log(err);
        res.send(err);
    }

}





getLength = () => {
    return new Promise((resolve, reject) => {
        console.log("------getLength-----------");
        fileModel.find().then(files => {
            console.log(files.length, "sucess");
            resolve(files.length)
        })
    })
}
display = (req, res) => {
    res.sendFile(path.join(__dirname, "../uploads/", req.params.fileName));
};
uploadFileAndSave = (req, file, key, dateNow) => {
  
    return new Promise(async (resolve, reject) => {
        let pathDir = req.params.userName + "/";
        
        console.log("uvi",req.body,file)
        console.log("file",file)

        console.log(file.name)
        const typeFolder = getTypeFolder(file.name);
        console.log("type", typeFolder);
        if (typeFolder) {
            pathDir += req.body.app ? req.body.app + "/" : "";
            pathDir += req.body.appId ? req.body.appId + "/" : "";
            pathDir += typeFolder + "/";
            currentPath = path.join(__dirname, "../uploads/", pathDir, dateNow + "__" + file.name)
            let urlPath = "https://files.codes" + currentPath.slice(4, currentPath.length);
            console.log("currentPath", currentPath.slice(6, currentPath.length), file);
            file.mv(currentPath).then(async (data) => {
                filesData = Object.assign({ [key]: { name: file.name, url: urlPath, size: file.size,tags:req.body.tags } }, filesData)
                console.log("inside filesData", filesData);
                resolve(true)
            })


        }
    })
}
uploadMultipleFiles = async (req, res) => {
    // const dateNow = Date.now();
    console.log("arrive to uploadMultipleFiles");
    let size = await checkOver2GB(req);
    if (size == true) {
        res.status(401).json({
            Message: "this user has over 2 GB",
        });
        console.log("this user has over 2 GB");
    } else {
        filesData = [];
        if (!req.files)
            res.status(400).send("no files toUpload")
        const files = Object.keys(req.files);
        console.log('upload Files', req.files);
        Promise.all(files.map(async (file, index) => {
            let dateNow = Date.now()
        
            await uploadFileAndSave(req, req.files[file], file, dateNow);
            console.log("after uploaded");
        }
        )).then(() => {
            console.log("filesData:", filesData);
            res.send({ message: "files upload succesfully", filesData })

        })
    }
}
removeFile30dayAfterDeleted = async () => {
    console.log("now removed all old file that moved to arcyon")
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const files = await fileModel.find({ delete: true, deleteToArchiv: { $lte: date } })
    console.log(files.length);
    Promise.all(files.map(async (file) => {
        if (file.url && fs.existsSync(file.url))
            await removeOneFile(file.url);
        else {
            return "fileIsNotExist"
        }
    }
    )).then((results) => {
        console.log("files removed succesfully", results)
    })

}
removeOneFile = (url) => {
    return new Promise((resolve, reject) => {
        const urlToRemove = path.join(__dirname, "../uploads/", url.replace("https://files.codes/uploads", ""));
        console.log("urlToRemove", urlToRemove);
        fs.unlink(urlToRemove, (err) => {
            if (err) {
                console.log(err);
                reject(err)
            }
            else {
                console.log("succssedd!!!");
                resolve("succssedd!!")
            }
        });
    })

}

removeMultipleFiles = async (req, res, next) => {
    console.log('removeMultipleFiles', req.body)
    const { urls } = req.body;

    if (!Object.keys(urls).length)
        res.status(400).send("no files toremove")
    else {
        console.log('remove Files', Object.keys(urls));
        Promise.all(Object.keys(urls).map(async (key) => {
            if (urls[key])
                await removeOneFile(urls[key]);
        }
        )).then((results) => {
            console.log("---------------", results)
            res.status(200).json({
                message: "file removed succesfully",
                urls
            });
        }).catch((error) => {
            console.log(error)
            res.status(500).json({
                message: error,
            });
        })
    }


}
saveFileDB = async (userName, file) => {
    console.log("saveFileDB ", file)
    return new Promise(async (resolve, reject) => {
        const name = file.url.slice(file.url.lastIndexOf('/') + 1, file.url.length)
        const date = name.includes("__")?new Date(parseInt(name.split("__")[0], 10)) :Date.now()
        const size = file.size ? file.size / 1024 / 1024 : 0
        const newFile = new fileModel({
           
            userName,
            name,
            url: file.url,
            dateCreated: Date.now(),
            size: size,
            tags:file.tags,
            icon: iconsClasses[file.name.toLowerCase().slice(file.name.lastIndexOf(".") + 1, file.name.length)],
            delete: false,
        });
        try {
            const fileSaved = await newFile.save();
            console.log('saveFileDB', fileSaved);
            resolve(fileSaved)
        } catch (err) {
            console.log(err);
            reject(err)
        }
    })
}


var iconsClasses = {
    ai: "file-ai.svg",
    docx: "file-docx.svg",
    pdf: "file-pdf.svg",
    xls: "file-xls.svg",
    psd: "file-psd.svg",
    pptx: "file-pptx.svg",
    png: "file-png.svg",
    jpg: "file-jpg.svg",
    jpeg: "file-jpg.svg",
    mp3: "file-mp3.svg",
    mp4: "file-mp4.svg",
    svg: "file-svg.svg"
};
getTypeFolder = (name) => {
    console.log(name)
    
    let fileName = name.toLowerCase()
    let type = fileName.slice(fileName.lastIndexOf(".") + 1, fileName.length);
    let typeFolder;
    console.log("typeFolder", type)
    if (!iconsClasses[type.toLowerCase()])
        return false;
    switch (type) {
        case "jpg":
        case "png":
            typeFolder = "img"
            break;
        case "mp4":
            typeFolder = "mp4"
            break;
        default:
            typeFolder = "others"

    }
    return typeFolder;
}





savedMultiFilesDB= async (req, res) => {
    console.log("in savedMultiFilesDB")
    const { files } = req.body;
    if(files){
        console.log(req.body);   
    console.log('files', files);
    console.log('values', Object.values(files));
    Promise.all(Object.values(files).map(async (file, index) => {
        await saveFileDB(req.params.userName, file);
    })).then((savedFiles) => {
        res.send({ massage: "files send successfully!!" })
    })}
    else{
        console.log(req.body)
        res.send({ massage: "files undefined" })
    }
}
updateMultiFilesDB = async (req, res) => {
    const { files, urls } = req.body;
    console.log(files, urls)
    console.log('values', Object.values(files));
    Promise.all(Object.keys(files).map(async (key, index) => {
        await updateFileDB(urls[key], req.params.userName, files[key]);
    })).then((savedFiles) => {
        res.send({ massage: "files send successfully!!" })
    })
}
module.exports = {
    savedMultiFilesDB,
    viewFileDetails,
    viewFiles,
    getAllFiles,
    // deleteFile,
    findByTag,
    updateTag,
    display,
    download,
    remove,
    viewUploadFile,
    upload,
    createNewFolder,
    // fileToArchiv,
    multiFilesToArchiv,
    recovereMultiFiles,
    showDeletedFiles,
    findById,
    findShareById,
    saveNotes,
    editNotes,
    checkOver2GB,
    // viewSharedFile,
    findSaredUsers,
    viewFileShared,
    viewPublicFileShared,
    shareFile,
    getSharedFiles,
    getUidByUserName,
    uploadMultipleFiles,
    removeMultipleFiles,
    updateFile,
    updateMultiFilesDB,
    removeFile30dayAfterDeleted
};
