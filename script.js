import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
  
const firebaseConfig = {
  apiKey: "AIzaSyBe7d9bllq8RnmI6xxEBk3oub3qogPT2aM",
  authDomain: "thinkwise-c7673.firebaseapp.com",
  databaseURL: "https://thinkwise-c7673-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "thinkwise-c7673",
  storageBucket: "thinkwise-c7673.appspot.com",
  messagingSenderId: "37732571551",
  appId: "1:37732571551:web:9b90a849ac5454f33a85aa",
  measurementId: "G-8957WM4SB7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Funktion zum Laden der Ereignisse des Benutzers aus Firestore
function loadUserEvents() {
  const user = auth.currentUser;
  if (user) {
    db.collection("users").doc(user.uid).collection("events")
      .get()
      .then((querySnapshot) => {
        eventsArr.length = 0; // Leeren Sie das Array, bevor Sie neue Daten hinzufügen
        querySnapshot.forEach((doc) => {
          const event = { id: doc.id, ...doc.data() };
          eventsArr.push(event);
        });
        updateCalendarWithEvents(); // Funktion, um den Kalender mit den neuen Events zu aktualisieren
      })
      .catch((error) => {
        console.error("Error loading events: ", error);
      });
  } else {
    console.log("User not logged in, cannot load events.");
  }
}

function redirectToLogin() {
  window.location.href = 'https://benjiwurfl.github.io/Login/';
}

// Authentifizierungsstatus beibehalten
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Der Benutzer ist angemeldet und `user.uid` ist verfügbar.
    console.log("User is signed in with UID:", user.uid);
    // Hier können Sie Funktionen aufrufen, die die UID verwenden.
    loadUserEvents();
  } else {
    // Kein Benutzer ist angemeldet.
    console.log("No user is signed in.");
    redirectToLogin();
  }
});

const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper "),
  addEventCloseBtn = document.querySelector(".close "),
  addEventTitle = document.querySelector(".event-name "),
  addEventFrom = document.querySelector(".event-time-from "),
  addEventTo = document.querySelector(".event-time-to "),
  addEventSubmit = document.querySelector(".add-event-btn ");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventsArr = [];
console.log(eventsArr);

//function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

  date.innerHTML = months[month] + " " + year;

  let days = "";

  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    //check if event is present on that day
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
  loadUserEvents();
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

initCalendar();

//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}

//function get active day day name and date and update eventday eventdate
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}

function updateEvents(selectedDay) {
  let events = "";
  eventsArr.forEach((eventObj) => {
    if (
      selectedDay === eventObj.day &&
      month + 1 === eventObj.month &&
      year === eventObj.year
    ) {
      eventObj.events.forEach((event) => {
        events += `<div class="event">
            <div class="title">
              <i class="fas fa-circle"></i>
              <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-time">
              <span class="event-time">${event.timeFrom} - ${event.timeTo}</span>
            </div>
        </div>`;
      });
    }
  });

  if (events === "") {
    events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
  }

  eventsContainer.innerHTML = events;
}

//function to add event
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
  }
});

//allow 50 chars in eventtitle
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

//allow only time in eventtime from and to
addEventFrom.addEventListener("input", (e) => {
  addEventFrom.value = addEventFrom.value.replace(/[^0-9:]/g, "");
  if (addEventFrom.value.length === 2) {
    addEventFrom.value += ":";
  }
  if (addEventFrom.value.length > 5) {
    addEventFrom.value = addEventFrom.value.slice(0, 5);
  }
});

addEventTo.addEventListener("input", (e) => {
  addEventTo.value = addEventTo.value.replace(/[^0-9:]/g, "");
  if (addEventTo.value.length === 2) {
    addEventTo.value += ":";
  }
  if (addEventTo.value.length > 5) {
    addEventTo.value = addEventTo.value.slice(0, 5);
  }
});

//function to add event to eventsArr
addEventSubmit.addEventListener("click", () => {
  const eventTitle = addEventTitle.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;
  if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
    alert("Please fill all the fields");
    return;
  }

  // Überprüfen des Zeitformats und andere Validierungen...

  const newEvent = {
    title: eventTitle,
    timeFrom: eventTimeFrom,
    timeTo: eventTimeTo,
    day: activeDay,
    month: month + 1,
    year: year,
    date: new Date(year, month, activeDay) // Datum des Events
  };

  addEventToFirestore(newEvent);
});

function addEventToFirestore(newEvent) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add events.");
    return;
  }

  db.collection("users").doc(user.uid).collection("events").add(newEvent)
    .then(docRef => {
      console.log("Event added with ID: ", docRef.id);
      newEvent.id = docRef.id; // Fügen Sie die ID zum Event hinzu
      eventsArr.push(newEvent); // Fügen Sie das Event zum Array hinzu
      updateEvents(activeDay); // Aktualisieren Sie den Kalender
      //select active day and add event class if not added
      const activeDayEl = document.querySelector(".day.active");
      if (!activeDayEl.classList.contains("event")) {
        activeDayEl.classList.add("event");
      }
    })
    .catch(error => {
      console.error("Error adding event: ", error);
    });

  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
}

//function to delete event when clicked on event
eventsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("event")) {
    if (confirm("Are you sure you want to delete this event?")) {
      const eventElement = e.target.closest(".event");
      const eventTitle = eventElement.querySelector(".event-title").innerHTML;

      // Finden des Event-Objekts im Array
      const eventObj = eventsArr.find(event => 
        event.day === activeDay &&
        event.month === month + 1 &&
        event.year === year &&
        event.events.some(item => item.title === eventTitle)
      );

      if (eventObj) {
        const eventToDelete = eventObj.events.find(item => item.title === eventTitle);
        if (eventToDelete && eventToDelete.id) {
          deleteEventFromFirestore(eventObj.id, eventToDelete.id);
        }
      }
    }
  }
});

function deleteEventFromFirestore(eventObjId, eventId) {
  const user = auth.currentUser;
  if (!user) {
    console.log("User not logged in, cannot delete event.");
    return;
  }

  db.collection("users").doc(user.uid).collection("events").doc(eventId)
    .delete()
    .then(() => {
      console.log("Event successfully deleted!");
      removeEventFromLocalArray(eventObjId, eventId); // Entfernen Sie das Event aus Ihrem lokalen Array
      updateEvents(activeDay); // Aktualisieren Sie den Kalender
    })
    .catch(error => {
      console.error("Error removing event: ", error);
    });
}

function removeEventFromLocalArray(eventObjId, eventId) {
  const eventObjIndex = eventsArr.findIndex(event => event.id === eventObjId);
  if (eventObjIndex > -1) {
    const eventIndex = eventsArr[eventObjIndex].events.findIndex(event => event.id === eventId);
    if (eventIndex > -1) {
      eventsArr[eventObjIndex].events.splice(eventIndex, 1);
      // Wenn keine Events mehr für diesen Tag vorhanden sind, entfernen Sie das Event-Objekt
      if (eventsArr[eventObjIndex].events.length === 0) {
        eventsArr.splice(eventObjIndex, 1);
        const activeDayEl = document.querySelector(".day.active");
        if (activeDayEl.classList.contains("event")) {
          activeDayEl.classList.remove("event");
        }
      }
    }
  }
}

/*
//function to save events in local storage
function saveEvents() {
  localStorage.setItem("events", JSON.stringify(eventsArr));
}
*/

/*
//function to get events from local storage
function getEvents() {
  //check if events are already saved in local storage then return event else nothing
  if (localStorage.getItem("events") === null) {
    return;
  }
  eventsArr.push(...JSON.parse(localStorage.getItem("events")));
}
*/

/*
function convertTime(time) {
  //convert time to 24 hour format
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}
*/