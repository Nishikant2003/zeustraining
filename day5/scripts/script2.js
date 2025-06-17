// White border under links for active page
var links = document.querySelectorAll("a");
links.forEach(function (link) {
    if (link instanceof HTMLAnchorElement && link.href === window.location.href) {
        link.classList.add("active");
    }
});
// Course Tabs
var tabs = document.querySelectorAll(".course-tab > div");
tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        tabs.forEach(function (t) { return t.classList.remove("active"); });
        tab.classList.add("active");
    });
});
// Alert Dropdown
fetch('json/alert.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
    var alerts = document.getElementById("alert-dropdown");
    if (alerts) {
        alerts.innerHTML = data.map(function (item) { return "\n        <div ".concat(item.read ? '' : 'class="card-bg1"', ">\n          ").concat(item.read
            ? "<img src=\"assets/checkmark.svg\" alt=\"checkmark\" class=\"checkmark-icon\">"
            : "<img src=\"assets/dnd.svg\" alt=\"dnd\" class=\"dnd-icon\">", "\n          <p class=\"title\">").concat(item.title, "</p>\n          <p class=\"course-class\">\n            <span>").concat(item.courseClass.split(" ")[0], "</span>\n            ").concat(item.courseClass.split(" ")[1] || '').concat(item.courseClass.split(" ")[2] || '', "\n          </p>\n          <p class=\"date\">").concat(item.date, "</p>\n        </div>\n      "); }).join('');
    }
})
    .catch(console.error);
// Announcement Dropdown
fetch('json/ann.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
    var ann = document.getElementById("announcement-dropdown");
    if (ann) {
        ann.innerHTML = data.map(function (item) { return "\n        <div class=\"".concat(item.read ? '' : 'card-bg1', "\">\n          ").concat(item.read
            ? "<img src=\"assets/checkmark.svg\" alt=\"checkmark\" class=\"checkmark-icon\">"
            : "<img src=\"assets/dnd.svg\" alt=\"dnd\" class=\"dnd-icon\">", "\n          <p class=\"ann-name\"><span>PA:</span>").concat(item.annName, "</p>\n          <p class=\"ann-title\">").concat(item.title, "</p>\n          <p class=\"ann-course-class\"><span>").concat(item.courseClass, "</span></p>\n          <p class=\"files-date\">\n            <span class=\"files\">\n              ").concat(item.files ? "<img src=\"assets/paperclip.svg\" alt=\"paperclip\">" : '', "\n              <span>").concat(item.files ? "".concat(item.files, " files are attached") : '', "</span>\n            </span>\n            <span class=\"date\">").concat(item.date, "</span>\n          </p>\n        </div>\n      "); }).join('');
    }
})
    .catch(console.error);
// Menu toggle
if (window.innerWidth <= 950) {
    document.querySelectorAll('.toggle').forEach(function (item) {
        item.addEventListener('click', function () {
            document.querySelectorAll('.toggle').forEach(function (otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                    var otherNext = otherItem.nextElementSibling;
                    if (otherNext)
                        otherNext.style.display = 'none';
                }
            });
            item.classList.toggle('open');
            var next = item.nextElementSibling;
            if (next) {
                next.style.display = next.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
}
// Cards data
fetch('json/card.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
    var courseCards = document.getElementById("cards");
    if (courseCards) {
        courseCards.innerHTML = data.map(function (item) {
            var _a, _b, _c, _d;
            return "\n        <div class=\"card\">\n          <div class=\"card__details\">\n            <svg class=\"star-icon ".concat(item.isFavorite ? 'filled' : '', "\" viewBox=\"0 0 24 24\">\n              <polygon points=\"12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9\" />\n            </svg>\n            <div class=\"").concat(item.status === 'expired' ? 'expiry-tag' : '', "\">\n              ").concat(item.status === 'expired' ? 'Expired' : '', "\n            </div>\n            <img class=\"card-image\" src=\"").concat(item.imageUrl, "\" alt=\"").concat(item.title, "\">\n            <div class=\"card__details__text\">\n              <div class=\"course-name\">").concat(item.title, "</div>\n              <p>").concat(item.subject, " | ").concat(item.grade, " <span id=\"grade\">").concat(item.gradeDelta, "</span></p>\n              <p>\n                <span>").concat((_a = item.units) !== null && _a !== void 0 ? _a : '', "</span> ").concat(item.units ? 'Units' : '', "\n                <span>").concat((_b = item.lessons) !== null && _b !== void 0 ? _b : '', "</span> ").concat(item.units ? 'Lessons' : '', "\n                <span>").concat((_c = item.topics) !== null && _c !== void 0 ? _c : '', "</span> ").concat(item.units ? 'Topics' : '', "\n              </p>\n              <div class=\"custom-select\" style=\"margin-top:20px; margin-bottom:5px;\">\n                <select name=\"courseSel\" id=\"courseSel\">\n                  <option value=\"No Classes\" ").concat(item.class === "No Classes" ? 'selected' : '', ">No Classes</option>\n                  <option value=\"Mr. Frank's Class B\" ").concat(item.class === "Mr. Frank's Class B" ? 'selected' : '', ">Mr. Frank's Class B</option>\n                  <option value=\"Mr. Frank's Class A\" ").concat(item.class === "Mr. Frank's Class A" ? 'selected' : '', ">Mr. Frank's Class A</option>\n                  <option value=\"All Classes\" ").concat(item.class === "All Classes" ? 'selected' : '', ">All Classes</option>\n                </select>\n                <img class=\"downarr\" src=\"icons/arrow-down.svg\" alt=\"down\">\n              </div>\n              <p>").concat(item.students ? "".concat(item.students, " Students") : '', " ").concat(item.startDate ? "| ".concat(item.startDate, " -") : '', "  ").concat((_d = item.endDate) !== null && _d !== void 0 ? _d : '', "</p>\n            </div>\n          </div>\n          <div class=\"line2\"></div>\n          <div class=\"card-icons\">\n            <img src=\"icons/preview.svg\" alt=\"Preview\">\n            <img class=").concat(item.startDate ? "normal" : "opaclass", " src=\"icons/manage course.svg\" alt=\"Manage\">\n            <img class=").concat(item.startDate ? "normal" : "opaclass", " src=\"icons/grade submissions.svg\" alt=\"Grade\">\n            <img src=\"icons/reports.svg\" alt=\"Reports\">\n          </div>\n        </div>\n      ");
        }).join('');
        // Favorite star toggling
        courseCards.querySelectorAll('.star-icon').forEach(function (star) {
            star.addEventListener('click', function () {
                star.classList.toggle('filled');
            });
        });
    }
})
    .catch(console.error);
