const express = require("express");
const router = express.Router();
const filesController = require("../controller/files.js");
const permissionsController = require("../controller/permissions.js")

router.post("/:uId/createPermission", permissionsController.createPermission);
router.post("/:uId/checkPermission", permissionsController.checkObjectPermission);
router.post("/:uId/askPermission", permissionsController.askForPermission);
router.get("/:uId/getAllPermissions/:applicationName", permissionsController.getAllUserPermissions);
router.delete("/:uId/:id", permissionsController.deletePermission);
router.delete("/:uId/deleteByObjectId/:objectId", permissionsController.deletePermissionByObjectId);



router.get('/getUser/:userName', filesController.getUidByUserName);
router.get("/:userName", filesController.getAllFiles);
// router.get("/:uId/download/uploads/:uId/:type/:fileName", filesController.download);
router.get("/:userName/download/*", filesController.download);
router.delete("/:userName/remove/*", filesController.remove);
router.put("/:userName/update/*", filesController.updateFile);
router.post("/:userName/uploadMultipleFiles", filesController.uploadMultipleFiles);
router.post("/:userName/removeMultipleFiles", filesController.removeMultipleFiles);
router.post("/:userName/savedMultiFilesDB", filesController.savedMultiFilesDB);
router.post("/:userName/updateMultiFilesDB", filesController.updateMultiFilesDB);
router.post("/:userName/upload", filesController.upload);
router.post("/:userName/createNewFolder", filesController.createNewFolder);
// router.delete("/:uId/:fileId", filesController.deleteFile);
// router.put("/:uId/delete", filesController.fileToArchiv);
router.get("/:userName/showDeletedFiles", filesController.showDeletedFiles);
router.post("/:userName/getById", filesController.findById);
router.get("/:userName/findByTag/*", filesController.findByTag);
router.put("/:userName/moveTo", filesController.updateTag);
router.post("/:userName/getShareById/:ownerUserName", filesController.findShareById);
router.post("/:userName/saveNotes", filesController.saveNotes);
router.post("/:uId/editNotes", filesController.editNotes);
router.post("/:userName/shareFile", filesController.shareFile);
router.get("/:userName/getSharedFiles", filesController.getSharedFiles);
router.put("/:userName/multiFilesToArchiv", filesController.multiFilesToArchiv);
router.put("/:userName/recovereMultiFiles", filesController.recovereMultiFiles);
// router.get("/:sharedEmail/:fileId/:ownerUid/share", filesController.viewFileShared)
// router.get("/:uId/:sharedEmail/:fileId/:ownerUid/share", filesController.viewFileShared)
router.get("/:email/findSaredUsers", filesController.findSaredUsers)

// router.get("/:uId/:email/unSubscribe", permissionsController.unSubscribe);
// router.get("/:uId/:emailToAdd/unSubscribeAsking", permissionsController.unSubscribeAsking);

module.exports = router;
