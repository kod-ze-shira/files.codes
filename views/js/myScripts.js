let userName;
let uId;
let filesData;
let filedata;

function saveUserName() {
  let url = window.location;
  userName = url.pathname.split("/")[1];
  console.log(userName);
  localStorage.setItem("userName", userName);
  getUidByUserName(userName);
}
function saveUid(userName) {
  console.log("saveUid", userName);
  $.ajax({
    type: "GET",
    url: "https://files.leader.codes/api/getUser/" + userName,
    headers: { Authorization: jwtFromCookie },

    success: function (data) {
      console.log("data:", data);
      let uId = data.uid;
      console.log(uId);
      localStorage.setItem("uId", uId);
    },
  });
}
function getUidByUserName(userName) {
  console.log("by getUidByUserName ");
  console.log(userName);
  $.ajax({
    url: "https://files.leader.codes/api/getUser/" + userName,
    method: "GET",
    withCradentials: true,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      uId = data.uid;
      localStorage.setItem("uId", uId);
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function loadFiles() {
  console.log("in loadFiles");
  uId = localStorage.getItem("uId");
  $.ajax({
    type: "GET",
    url: "https://files.leader.codes/api/" + uId,
    headers: { Authorization: jwtFromCookie },

    success: function (data) {
      data = JSON.parse(data);
      console.log(data.length);
      if (data.length > 0) {
        window.location = "https://files.leader.codes/" + userName + "/files";
      }
    },
  });
}

function viewFileDetails(fileId, OwnerUid) {
  // debugger;
  localStorage.setItem("fileId", fileId);
  localStorage.setItem("OwnerUid", OwnerUid);
  window.location = "https://files.leader.codes/" + userName + "/file-details";
}

async function viewDetails() {
  let sharing = localStorage.getItem("sharing");
  console.log("sharing ", sharing);
  //saveUid();
  //saveUserName();
  if (window.location.pathname.endsWith("/share") || sharing == "true") {
    //this user is shared
    let fileId;
    let uEmail;
    let ownerUid;

    if (sharing == "true") {
      fileId = localStorage.getItem("fileId");
      uEmail = localStorage.getItem("uId");
      ownerUid = localStorage.getItem("OwnerUid");
    } else {
      fileId = window.location.pathname.split("/")[3];
      uEmail = window.location.pathname.split("/")[2];
      ownerUid = window.location.pathname.split("/")[4];
    }
    var filedata;
    var permission;
    var userName = localStorage("userName");
    var uId = localStorage.getItem("uId");
    console.log(uId);
    console.log(fileId);
    $.ajax({
      type: "POST",
      url: "https://files.leader.codes/api/" + uId + "/checkPermission",
      data: JSON.stringify({
        objectId: fileId,
        sharedEmail: uEmail,
        ownerUid: ownerUid,
      }),
      dataType: "json",
      contentType: "application/json",
      headers: { Authorization: jwtFromCookie },
      success: function (data) {
        permission = data.permission;
        if (permission == "none") {
          //don't have permission
          document.location = "../../views/none.html";
          return;
        }
        if (permission == "viewer") {
          //only can see
          $("#addNotes").hide();
          $("#btnShare").hide();
        } else if (permission == "editor") {
          //can add notes
          //hide delete
        } else if (permission == "admin") {
          //can add notes and delete
        }
      },
      error: function (err) {
        console.log(err);
      },
    });
    $.ajax({
      type: "POST",
      url:
        "https://files.leader.codes/api/" +
        uId + //לעשות שיהיה דינאמי
        "/getShareById" +
        "/" +
        ownerUid,
      data: JSON.stringify({ fileId: fileId }),
      dataType: "json",
      contentType: "application/json",
      headers: { Authorization: jwtFromCookie },
      success: function (data) {
        filedata = data;
        console.log(filedata);
        $("#fileIcon").attr("src", "/views/img/" + filedata[0].icon);
        $("#fileTitle").html(filedata[0].name.split("__")[1]);
        $("#fileSize").html(filedata[0].size);
        var htmlToAppend = "";
        console.log(filedata[0].notes.length);
        data[0].notes.forEach((element) => {
          htmlToAppend += "&nbsp;&nbsp;&nbsp;&nbsp;" + element + "<br/>";
        });
        $("#fileComments").html(htmlToAppend);
      },
    });
  } else {
    var fileId = localStorage.getItem("fileId");
    var uId = localStorage.getItem("uId");
    var userName = localStorage.getItem("userName");
    console.log(userName);
    console.log(fileId);
    console.log(uId);
    $.ajax({
      type: "POST",
      url:
        "https://files.leader.codes/api/" +
        localStorage.getItem("uId") +
        "/getById",
      data: JSON.stringify({ fileId: fileId }),
      dataType: "json",
      contentType: "application/json",
      headers: { Authorization: jwtFromCookie },
      success: function (data) {
        console.log(data);
        $("#fileIcon").attr("src", "/views/img/" + data[0].icon);
        $("#fileTitle").html(data[0].name.split("__")[1]);
        $("#fileSize").html(data[0].size);
        var htmlToAppend = "";
        console.log(data[0].notes.length);
        data[0].notes.forEach((element) => {
          htmlToAppend += "&nbsp;&nbsp;&nbsp;&nbsp;" + element + "<br/>";
        });
        $("#fileComments").html(htmlToAppend);
        preFile(data);
      },
    });
  }
}

function showUploadPopup() {
  console.log("script");
  $("#uploadPopup").removeClass("invisible");
  $("#uploadPopup").addClass("visible");

}




function uploadFile() {
  var fileToUpload = $("#uploadInput")[0].files[0];
  if (fileToUpload.size > 5242880) {
    alert("sorry,too big file!");
  }
  if (!iconsClasses[fileToUpload.name.split(".")[1]]) {
    alert("sorry, this file type not support!");
  } else {
    var myFile = new FormData();
    myFile.append("file", fileToUpload);
    console.log(fileToUpload);
    console.log(myFile);
    myFile.append("tags", []);
    var ending = fileToUpload.name.split(".")[1];
    console.log(ending);
    myFile.append("icon", iconsClasses[ending]);
    console.log(iconsClasses[ending]);

    $.ajax({
      type: "POST",
      url: "https://files.leader.codes/api/" + uId + "/upload",
      headers: { Authentication: jwtFromCookie },
      // mimeType: "multipart/form-data",
      data: myFile,
      processData: false,
      contentType: false,
      success: function (data) {
        $("#uploadPopup").removeClass("visible");
        $("#uploadPopup").addClass("invisible");
        alert("upload success");
        window.location = "https://files.leader.codes/" + localStorage.getItem('userName');
      },
      error: function (err) {
        alert(err);
      },
    });
  }
  loadFiles();
}
function backToViewFiles() {
  console.log('in backToViewFiles')
  userName = localStorage.getItem("userName");
  window.location = "https://files.leader.codes/" + userName;
}

function viewFiles() {
  // getUidByUserName();
  // saveUid();
  saveUserName();
  localStorage.setItem("sharing", false);
  let jwtFromCookie = document.cookie
    ? document.cookie
      .split(";")
      .filter((s) => s.includes("jwt"))[0]
      .split("=")
      .pop()
    : null;
  console.log("in view");
  console.log(jwtFromCookie);
  let url = window.location;
  //uId = url.pathname.split("/")[1];
  //localStorage.setItem("uId", uId);
  $.ajax({
    type: "GET",
    url: "https://files.leader.codes/api/" + localStorage.getItem("uId"),
    headers: { Authorization: jwtFromCookie },
    success: function (data) {
      // data = JSON.parse(data);

      console.log(data[0]);
      saveData(data);
    },
  });
}
function saveData(data) {
  console.log("insave");
  filesData = data;
  console.log(filesData);
  showData();
}

function showArchiv() {
  localStorage.setItem("sharing", false);
  console.log("in showArchiv");
  console.log(localStorage.getItem("uId"));
  $.ajax({
    type: "GET",
    url:
      "https://files.leader.codes/api/" +
      localStorage.getItem("uId") +
      "/showDeletedFiles",
    headers: { Authorization: jwtFromCookie },
    success: function (data) {
      data = JSON.parse(data);
      console.log(data[0]);
      saveData(data);
    },
  });
}

function showSharedFiles() {
  localStorage.setItem("sharing", true);
  console.log("in showSharedFiles");
  console.log(localStorage.getItem("uId"));
  $.ajax({
    type: "GET",
    url:
      "https://files.leader.codes/api/" +
      localStorage.getItem("uId") +
      "/getSharedFiles",
    headers: { Authorization: jwtFromCookie },
    success: function (data) {
      data = JSON.parse(data);
      console.log(data[0]);
      saveData(data);
    },
  });
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
  mp3: "file-mp3.svg",
  mp4: "file-mp4.svg",
};

function saveNote() {
  console.log("in saveNote!");
  var notes = document.getElementById("notes").value;
  const fileId = localStorage.getItem("fileId");
  uId = localStorage.getItem("uId");
  console.log(uId);
  console.log(notes);
  console.log(fileId);
  $.ajax({
    type: "POST",
    url: "https://files.leader.codes/api/" + uId + "/saveNotes",
    headers: { Authorization: jwtFromCookie },
    // mimeType: "multipart/form-data",
    data: JSON.stringify({ notes: notes, fileId: fileId }),
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.log("save note! ", data);
      viewDetails();
    },
  });
}

function compareValues(key, order = "asc") {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === "desc" ? comparison * -1 : comparison;
  };
}
function sortByName() {
  var filesByName = filesData.sort(function (a, b) {
    return a.name.split("__")[1].localeCompare(b.name.split("__")[1]);
  });

  saveData(filesByName);
}

function sortBySize() {
  var filesBySize = filesData.sort(compareValues("size"));
  console.log(filesBySize);
  saveData(filesBySize);
}

function sortByDate() {
  var filesByDate = filesData.sort(compareValues("dateCreated"));
  console.log(filesByDate);
  saveData(filesByDate);
}
function sortByTag() {
  var filesByTag = filesData.sort(compareValues("tag"));
  console.log(filesByTag);
  saveData(filesByTag);
}

function showData() {
  var listing_table = document.getElementById("dataBody");
  var listing_grid_table = document.getElementById("dataGridBody");
  // listing_table.remove();
  listing_table.innerHTML = "";
  listing_grid_table.innerHTML = "";

  for (var i = 0; i < filesData.length; i++) {
    listing_table.innerHTML +=
      `
<div class="data__item" onclick="viewFileDetails('${filesData[i]._id}'` +
      `,` +
      `'${filesData[i].uId}')">
              <div class="data__row">
                <div class="data__cell data__cell_lg">
                  <div class="data__main">
                    <div class="data__preview data__preview_file bg-yellow"><img class="data__pic"
                        src=` +
      "/views/img/" +
      filesData[i].icon +
      `></div>
                    <div class="data__wrap">
                      <div id="dataContent" class="data__content"><strong>` +
      filesData[i].name.split("__")[1] +
      `</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data__cell mobile-hide">
                  <div id="dataSize" class="data__label">` +
      filesData[i].size.toPrecision(4) +
      ` Mb</div>
                </div>
                <div class="data__cell mobile-hide">
                  <!-- meta-->
                  <div id="dataTag" class="meta"><i class="la la-tags "></i>Designer</div>
                </div>
                <div class="data__cell data__cell_members mobile-hide">
                  <!-- members-->
                  <div id="dataDateCreated" class="members">
                  ` +
      filesData[i].dateCreated.split("T")[0] +
      `
                  </div>
                </div>
                <div class="data__cell data__cell_action"><button class="action action_stroke"><i
                      class="la la-ellipsis-h "></i></button></div>
              </div>
            </div>
`;
    listing_grid_table.innerHTML +=
      ` <div  class="data__body">
<div class="data__item" onclick="viewFileDetails('${filesData[i]._id}'` +
      `,` +
      `'${filesData[i].uId}')">
  <div class="data__corner"><button class="action action_stroke"><i
        class="la la-ellipsis-h "></i></button></div>
  <div class="data__row">
    <div class="data__cell">
      <div class="data__main">
        <div class="data__preview data__preview_file bg-yellow"><img class="data__pic"
        src=` +
      "/views/img/" +
      filesData[i].icon +
      `></div>
        <div class="data__wrap">
          <div class="data__content"><strong> ` +
      filesData[i].name.split("__")[1] +
      `</strong></div>
          <div class="data__label">` +
      filesData[i].size +
      ` Mb</div>
        </div>
      </div>
    </div> 
    <div class="data__cell">
     
      <div class="meta"><i class="la la-tags "></i>Designer</div>
    </div>`;
  }
  $("#dataBody").pagify(6, ".data__item");
  // $("#dataGridBody").pagify(4, ".data__item");
}

$("#btnGrid").click(function () {
  $("#dataGridBody").pagify(4, ".data__item");
});

$("#btnList").click(function () {
  $("#dataBody").pagify(6, ".data__item");
});

function shareFile() {
  var sharedEmail = prompt("Please enter email");
  var permission = prompt("Please enter permission");
  var fileId = localStorage.getItem("fileId");
  if (sharedEmail)
    $.ajax({
      type: "POST",
      url:
        "https://files.leader.codes/api/" +
        localStorage.getItem("uId") +
        "/createPermission",
      headers: { Authorization: jwtFromCookie },
      data: JSON.stringify({
        applicationName: "files",
        sharedEmail: sharedEmail,
        objectId: fileId,
        permission: permission,
      }),
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        $.ajax({
          type: "POST",
          url:
            "https://files.leader.codes/api/" +
            localStorage.getItem("uId") +
            "/shareFile",
          headers: { Authorization: jwtFromCookie },
          data: JSON.stringify({
            sharedEmail: sharedEmail,
            fileId: fileId,
          }),
          dataType: "json",
          contentType: "application/json",
        });
        alert("file shared succesfuly");
      },
      error: function (err) {
        alert("error");
      },
    });
}

(function ($) {
  var pagify = {
    items: {},
    panContainer: null,
    totalPages: 1,
    perPage: 3,
    currentPage: 0,
    createNavigation: function () {
      console.log("itemsssssss: " + this.items.length);
      this.totalPages = Math.ceil(this.items.length / this.perPage);

      $(".mypagination", this.panContainer.parent()).remove();
      var pagination = $('<div class="mypagination"></div>').append(
        '<a class="mynav prev disabled" data-next="false"><</a>'
      );

      for (var i = 0; i < this.totalPages; i++) {
        var pageElClass = "page";
        if (!i) pageElClass = "page current";
        var pageEl =
          '<a class="' +
          pageElClass +
          '" data-page="' +
          (i + 1) +
          '">' +
          (i + 1) +
          "</a>";
        pagination.append(pageEl);
      }
      pagination.append('<a class="mynav next" data-next="true">></a>');

      this.panContainer.after(pagination);

      var that = this;
      $("body").off("click", ".mynav");
      this.navigator = $("body").on("click", ".mynav", function () {
        var el = $(this);
        that.navigate(el.data("next"));
      });

      $("body").off("click", ".page");
      this.pageNavigator = $("body").on("click", ".page", function () {
        var el = $(this);
        that.goToPage(el.data("page"));
      });
    },
    navigate: function (next) {
      // default perPage to 5
      if (isNaN(next) || next === undefined) {
        next = true;
      }
      $(".mypagination .mynav").removeClass("disabled");
      if (next) {
        this.currentPage++;
        if (this.currentPage > this.totalPages - 1)
          this.currentPage = this.totalPages - 1;
        if (this.currentPage == this.totalPages - 1)
          $(".mypagination .mynav.next").addClass("disabled");
      } else {
        this.currentPage--;
        if (this.currentPage < 0) this.currentPage = 0;
        if (this.currentPage == 0)
          $(".mypagination .mynav.prev").addClass("disabled");
      }

      this.showItems();
    },
    updateNavigation: function () {
      var pages = $(".mypagination .page");
      pages.removeClass("current");
      $(
        '.mypagination .page[data-page="' + (this.currentPage + 1) + '"]'
      ).addClass("current");
    },
    goToPage: function (page) {
      if (page === undefined) return;
      this.currentPage = page - 1;

      $(".mypagination .mynav").removeClass("disabled");
      if (this.currentPage == this.totalPages - 1)
        $(".mypagination .mynav.next").addClass("disabled");

      if (this.currentPage == 0)
        $(".mypagination .mynav.prev").addClass("disabled");
      this.showItems();
    },
    showItems: function () {
      this.items.hide();
      var base = this.perPage * this.currentPage;
      this.items.slice(base, base + this.perPage).show();

      this.updateNavigation();
    },
    init: function (panContainer, items, perPage) {
      this.panContainer = panContainer;
      this.currentPage = 0;
      this.totalPages = 1;
      this.perPage = perPage;
      this.items = items;
      this.createNavigation();
      this.showItems();
    },
  };

  // stuff it all into a jQuery method!
  $.fn.pagify = function (perPage, itemSelector) {
    var el = $(this);
    var items = $(itemSelector, el);

    // default perPage to 5
    if (isNaN(perPage) || perPage === undefined) {
      perPage = 3;
    }

    // don't fire if fewer items than perPage
    // if (items.length <= perPage) {
    //   return true;
    // }

    pagify.init(el, items, perPage);
  };
})(jQuery);

function preFile(file) {
  console.log("in pre");

  // var blob = new Blob();
  const obj_url = file[0].url;
  const iframe = document.getElementById("viewer");
  iframe.setAttribute("src", obj_url);
  URL.revokeObjectURL(obj_url);
  console.log(obj_url)

}
