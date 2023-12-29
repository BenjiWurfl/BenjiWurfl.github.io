import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
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

function markEventsOnCalendar() {
  // Gehe durch alle Tage im Kalender und prüfe, ob es für diesen Tag ein Event gibt
  document.querySelectorAll('.day').forEach(dayEl => {
    const day = Number(dayEl.textContent);
    const eventForDayExists = eventsArr.some(eventObj => eventObj.day === day && eventObj.month === month + 1 && eventObj.year === year);
    if (eventForDayExists) {
      // Füge die Klasse 'event' hinzu, um den Tag visuell zu markieren
      dayEl.classList.add('event');
    }
  });
}

// Funktion zum Laden der Ereignisse des Benutzers aus Firestore
function loadUserEvents() {
  const user = auth.currentUser;
  if (user) {
    const eventsRef = collection(db, "users", user.uid, "events");
    getDocs(eventsRef).then(querySnapshot => {
      eventsArr.length = 0;
      querySnapshot.forEach(doc => {
        const event = { id: doc.id, ...doc.data() };
        eventsArr.push(event);
      });
      if (activeDay) {
        updateEvents(activeDay); // Aktualisieren Sie den Kalender für den aktiven Tag
      }
      markEventsOnCalendar(); // Neu hinzugefügt - Markieren Sie Tage mit Events nach dem Laden
    }).catch(error => {
      console.error("Error loading events: ", error);
    });
  } else {
    console.log("No user is logged in, cannot load events.");
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

// Funktion, um zu einem bestimmten Datum zu navigieren
function gotoDate() {
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = Number(dateArr[1]);
      initCalendar(); // Initialisiert den Kalender neu mit dem neuen Monat und Jahr
      loadUserEvents(); // Lädt die Ereignisse für den neuen Monat und das neue Jahr
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
    // Direkter Zugriff auf die Eigenschaften des eventObj
    if (selectedDay === eventObj.day &&
        month + 1 === eventObj.month &&
        year === eventObj.year) {
      // Erstellen der Event-Darstellung ohne die Notwendigkeit, ein events-Array zu durchlaufen
      events += `<div class="event">
          <div class="title">
            <i class="fas fa-circle"></i>
            <h3 class="event-title">${eventObj.title}</h3>
          </div>
          <div class="event-time">
            <span class="event-time">${eventObj.timeFrom} - ${eventObj.timeTo}</span>
          </div>
      </div>`;
    }
  });

  if (events === "") {
    events = `<div class="no-event"><h3>No Events</h3></div>`;
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

  // Erstellen Sie eine Referenz zur "events"-Subkollektion des aktuellen Benutzers
  const eventsRef = collection(db, "users", user.uid, "events");

  // Fügen Sie das neue Event zur Datenbank hinzu
  addDoc(eventsRef, newEvent).then(docRef => {
    console.log("Event added with ID: ", docRef.id);
    newEvent.id = docRef.id; // Fügen Sie die ID zum Event hinzu
    eventsArr.push(newEvent); // Fügen Sie das Event zum Array hinzu
    updateEvents(activeDay); // Aktualisieren Sie den Kalender
    //select active day and add event class if not added
    const activeDayEl = document.querySelector(".day.active");
    if (!activeDayEl.classList.contains("event")) {
      activeDayEl.classList.add("event");
    }
  }).catch(error => {
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
        event.title === eventTitle
      );

      if (eventObj && eventObj.id) {
        deleteEventFromFirestore(eventObj.id);
      }
    }
  }
});

function deleteEventFromFirestore(eventId) {
  const user = auth.currentUser;
  if (!user) {
    console.log("User not logged in, cannot delete event.");
    return;
  }

  const eventRef = doc(db, "users", user.uid, "events", eventId);
  deleteDoc(eventRef)
    .then(() => {
      console.log("Event successfully deleted!");

      // Entfernen Sie das Event aus dem lokalen Array
      const eventIndex = eventsArr.findIndex(event => event.id === eventId);
      if (eventIndex !== -1) {
        eventsArr.splice(eventIndex, 1);
      }

      // Kalender neu initialisieren, um Änderungen widerzuspiegeln (Balken unter Datum)
      initCalendar();
    })
    .catch(error => {
      console.error("Error removing event: ", error);
    });
}