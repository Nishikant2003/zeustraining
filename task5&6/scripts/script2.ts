// White border under links for active page
const links = document.querySelectorAll("a");
links.forEach(link => {
  if (link instanceof HTMLAnchorElement && link.href === window.location.href) {
    link.classList.add("active");
  }
});

// Course Tabs
const tabs = document.querySelectorAll(".course-tab > div");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
  });
});

// Interfaces for JSON
interface AlertItem {
  read: boolean;
  title: string;
  courseClass: string;
  date: string;
}

interface AnnouncementItem {
  read: boolean;
  annName: string;
  title: string;
  courseClass: string;
  files: string;
  date: string;
}

interface CardItem {
  isFavorite: boolean;
  status: string;
  imageUrl: string;
  title: string;
  subject: string;
  grade: string;
  gradeDelta: string;
  units?: number;
  lessons?: number;
  topics?: number;
  class: string;
  students?: number;
  startDate?: string;
  endDate?: string;
}

// Alert Dropdown
fetch('json/alert.json')
  .then(res => res.json())
  .then((data: AlertItem[]) => {
    const alerts = document.getElementById("alert-dropdown");
    if (alerts) {
      alerts.innerHTML = data.map(item => `
        <div ${item.read ? '' : 'class="card-bg1"'}>
          ${item.read
            ? `<img src="assets/checkmark.svg" alt="checkmark" class="checkmark-icon">`
            : `<img src="assets/dnd.svg" alt="dnd" class="dnd-icon">`}
          <p class="title">${item.title}</p>
          <p class="course-class">
            <span>${item.courseClass.split(" ")[0]}</span>
            ${item.courseClass.split(" ")[1] || ''}${item.courseClass.split(" ")[2] || ''}
          </p>
          <p class="date">${item.date}</p>
        </div>
      `).join('');
    }
  })
  .catch(console.error);

// Announcement Dropdown
fetch('json/ann.json')
  .then(res => res.json())
  .then((data: AnnouncementItem[]) => {
    const ann = document.getElementById("announcement-dropdown");
    if (ann) {
      ann.innerHTML = data.map(item => `
        <div class="${item.read ? '' : 'card-bg1'}">
          ${item.read
            ? `<img src="assets/checkmark.svg" alt="checkmark" class="checkmark-icon">`
            : `<img src="assets/dnd.svg" alt="dnd" class="dnd-icon">`}
          <p class="ann-name"><span>PA:</span>${item.annName}</p>
          <p class="ann-title">${item.title}</p>
          <p class="ann-course-class"><span>${item.courseClass}</span></p>
          <p class="files-date">
            <span class="files">
              ${item.files ? `<img src="assets/paperclip.svg" alt="paperclip">` : ''}
              <span>${item.files ? `${item.files} files are attached` : ''}</span>
            </span>
            <span class="date">${item.date}</span>
          </p>
        </div>
      `).join('');
    }
  })
  .catch(console.error);

// Menu toggle
if(window.innerWidth <= 950) {
document.querySelectorAll('.toggle').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.toggle').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('open');
        const otherNext = otherItem.nextElementSibling as HTMLElement | null;
        if (otherNext) otherNext.style.display = 'none';
      }
    });

    item.classList.toggle('open');
    const next = item.nextElementSibling as HTMLElement | null;
    if (next) {
      next.style.display = next.style.display === 'block' ? 'none' : 'block';
    }
  });
});
}
// Cards data
fetch('json/card.json')
  .then(res => res.json())
  .then((data: CardItem[]) => {
    const courseCards = document.getElementById("cards");
    if (courseCards) {
      courseCards.innerHTML = data.map(item => `
        <div class="card">
          <div class="card__details">
            <svg class="star-icon ${item.isFavorite ? 'filled' : ''}" viewBox="0 0 24 24">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <div class="${item.status === 'expired' ? 'expiry-tag' : ''}">
              ${item.status === 'expired' ? 'Expired' : ''}
            </div>
            <img class="card-image" src="${item.imageUrl}" alt="${item.title}">
            <div class="card__details__text">
              <div class="course-name">${item.title}</div>
              <p>${item.subject} | ${item.grade} <span id="grade">${item.gradeDelta}</span></p>
              <p>
                <span>${item.units ?? ''}</span> ${item.units ? 'Units' : ''}
                <span>${item.lessons ?? ''}</span> ${item.units ? 'Lessons' : ''}
                <span>${item.topics ?? ''}</span> ${item.units ? 'Topics' : ''}
              </p>
              <div class="custom-select" style="margin-top:20px; margin-bottom:5px;">
                <select name="courseSel" id="courseSel">
                  <option value="No Classes" ${item.class === "No Classes" ? 'selected' : ''}>No Classes</option>
                  <option value="Mr. Frank's Class B" ${item.class === "Mr. Frank's Class B" ? 'selected' : ''}>Mr. Frank's Class B</option>
                  <option value="Mr. Frank's Class A" ${item.class === "Mr. Frank's Class A" ? 'selected' : ''}>Mr. Frank's Class A</option>
                  <option value="All Classes" ${item.class === "All Classes" ? 'selected' : ''}>All Classes</option>
                </select>
                <img class="downarr" src="icons/arrow-down.svg" alt="down">
              </div>
              <p>${item.students ? `${item.students} Students` : ''} ${item.startDate ? `| ${item.startDate} -` : ''}  ${item.endDate ?? ''}</p>
            </div>
          </div>
          <div class="line2"></div>
          <div class="card-icons">
            <img src="icons/preview.svg" alt="Preview">
            <img class=${item.startDate?"normal":"opaclass"} src="icons/manage course.svg" alt="Manage">
            <img class=${item.startDate?"normal":"opaclass"} src="icons/grade submissions.svg" alt="Grade">
            <img src="icons/reports.svg" alt="Reports">
          </div>
        </div>
      `).join('');

      // Favorite star toggling
      courseCards.querySelectorAll('.star-icon').forEach(star => {
        star.addEventListener('click', () => {
          star.classList.toggle('filled');
        });
      });
    }
  })
  .catch(console.error);
