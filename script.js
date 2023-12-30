import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
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
const eventsArr = [];

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

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

// Funktion, um zu überprüfen, ob ein Event jetzt beginnt und eine Benachrichtigung anzuzeigen
function checkForUpcomingEvents() {
  const currentTime = new Date();
  eventsArr.forEach(eventObj => {
    let eventDate;
    if (eventObj.date.seconds) { // Wenn das Datum im Firestore Timestamp-Format vorliegt
      eventDate = new Date(eventObj.date.seconds * 1000);
    } else { // Wenn das Datum als JavaScript-Date-Objekt vorliegt
      eventDate = new Date(eventObj.date);
    }

    // Extrahieren der Zeit aus 'timeFrom' und Kombinieren mit dem Datum
    const timeParts = eventObj.timeFrom.split(':');
    const eventTime = new Date(eventDate.setHours(timeParts[0], timeParts[1], 0, 0));

    // Überprüfung, ob das Event in der letzten Minute begonnen hat
    if (eventTime <= currentTime && eventTime > new Date(currentTime - 60000)) {
      alert(`Ihr Event "${eventObj.title}" hat begonnen!`);
    }
  });
}

// Aufruf der Funktion mit einem Intervall
setInterval(checkForUpcomingEvents, 60000);

function markEventsOnCalendar() {
  // Gehe durch alle Tage im aktuellen Monat im Kalender und prüfe, ob es für diesen Tag ein Event gibt
  document.querySelectorAll('.day:not(.prev-date):not(.next-date)').forEach(dayEl => {
    const day = Number(dayEl.textContent);
    const eventForDayExists = eventsArr.some(eventObj => eventObj.day === day && eventObj.month === month + 1 && eventObj.year === year);
    if (eventForDayExists) {
      // Füge die Klasse 'event' hinzu, um den Tag visuell zu markieren
      dayEl.classList.add('event');
    } else {
      // Entferne die Klasse 'event', falls keine Events vorhanden sind
      dayEl.classList.remove('event');
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
        const eventData = doc.data();
        let eventDate;

        // Überprüfen Sie, ob das Datum als Timestamp gespeichert ist
        if (eventData.date && eventData.date.seconds) {
          eventDate = new Date(eventData.date.seconds * 1000);
        } else if (eventData.date) {
          // Wenn das Datum im String-Format vorliegt
          eventDate = new Date(eventData.date);
        } else {
          // Standardwert, wenn kein Datum vorhanden ist
          eventDate = new Date();
        }

        const event = { id: doc.id, ...eventData, date: eventDate };
        eventsArr.push(event);
      });

      if (activeDay) {
        updateEvents(activeDay);
      }
      markEventsOnCalendar();
    }).catch(error => {
      console.error("Error loading events: ", error);
    });
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
  addEventDescription = document.querySelector(".event-description"),
  addEventSubmit = document.querySelector(".add-event-btn ");

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
  markEventsOnCalendar();
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
  markEventsOnCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
  markEventsOnCalendar();
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
  markEventsOnCalendar();
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
    if (selectedDay === eventObj.day && month + 1 === eventObj.month && year === eventObj.year) {
      let eventTimeText = eventObj.allDay ? "Ganztägig" : `${eventObj.timeFrom} - ${eventObj.timeTo}`;
      let eventDescriptionText = eventObj.description ? `<div class="event-description">${eventObj.description}</div>` : "";
      events += `<div class="event">
        <div class="title">
          <i class="fas fa-circle"></i>
          <h3 class="event-title">${eventObj.title}</h3>
        </div>
        ${eventDescriptionText} 
        <div class="event-time">
          <span class="event-time">${eventTimeText}</span>
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
  const eventDescription = addEventDescription.value;
  const allDay = document.getElementById('allDayEvent').checked;
  let eventTimeFrom = '00:00';
  let eventTimeTo = '23:59';

  if (!allDay) {
    eventTimeFrom = addEventFrom.value;
    eventTimeTo = addEventTo.value;
    if (eventTitle === "" || eventDescription === "" || eventTimeFrom === "" || eventTimeTo === "") {
      alert("Bitte füllen Sie alle Felder aus, es sei denn, es ist ein ganztägiges Ereignis.");
      return;
    }
  }

  const newEvent = {
    title: eventTitle,
    description: eventDescription, // Neue Beschreibung hinzufügen
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
  addEventDescription.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
}

//function to delete event when clicked inside the events container
eventsContainer.addEventListener("click", (e) => {
  const eventElement = e.target.closest(".event"); // Findet das nächste übergeordnete Element mit der Klasse `event`
  if (eventElement) { // Prüft, ob ein solches Element gefunden wurde
    if (confirm("Are you sure you want to delete this event?")) {
      const eventTitle = eventElement.querySelector(".event-title").textContent; // Zugriff auf den Titel

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
    markEventsOnCalendar();
}