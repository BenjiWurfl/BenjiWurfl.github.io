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
let editingEventId = null;

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

function redirectToLogin() {
  window.location.href = 'https://benjiwurfl.github.io/Login/';
}

// Authentifizierungsstatus beibehalten
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in with UID:", user.uid);
    loadUserEvents();
  } else {
    console.log("No user is signed in.");
    redirectToLogin();
  }
});

// Funktion, um zu überprüfen, ob ein Event jetzt beginnt und eine Benachrichtigung anzuzeigen
function checkForUpcomingEvents() {
  const currentTime = new Date();
  eventsArr.forEach(eventObj => {
    let eventDate;
    if (eventObj.date.seconds) { // Wenn das Datum im Firestore Timestamp-Format vorliegt
      eventDate = new Date(eventObj.date.seconds * 1000);
    } else {                     // Wenn das Datum als JavaScript-Date-Objekt vorliegt
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

setInterval(checkForUpcomingEvents, 60000);

function markEventsOnCalendar() {
  // Geht durch alle Tage im aktuellen Monat im Kalender und prüft, ob es für diesen Tag ein Event gibt
  document.querySelectorAll('.day:not(.prev-date):not(.next-date)').forEach(dayEl => {
    const day = Number(dayEl.textContent);
    const eventForDayExists = eventsArr.some(eventObj => eventObj.day === day && eventObj.month === month + 1 && eventObj.year === year);
    if (eventForDayExists) {
      // Fügt die Klasse 'event' hinzu, um den Tag visuell zu markieren
      dayEl.classList.add('event');
    } else {
      // Entfernt die Klasse 'event', falls keine Events vorhanden sind
      dayEl.classList.remove('event');
    }
  });
}

// Funktion zum Laden der Events des Benutzers aus Firestore
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

// DOM-Elemente für den Kalender
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

// Funktion zum Initialisieren des Kalenders
function initCalendar() {
  // Bestimmt erste, letzte etc. Tage des aktuellen Monats
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

  // Setzt das Datum im Kalenderkopf
  date.innerHTML = months[month] + " " + year;

  let days = "";

  // Fügt vorherige Tage des aktuellen Monats hinzu
  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  // Fügt Tage des aktuellen Monats hinzu
  for (let i = 1; i <= lastDate; i++) {
    //Überprüft, ob ein Ereignis an diesem Tag vorhanden ist
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
    // Aktuellen Tag markieren und Ereignisse hervorheben
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
      // Tage ohne Ereignisse hinzufügen
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  // Fügt nächste Tage des aktuellen Monats hinzu
  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }

  // Füllt den Kalender mit den Tagen
  daysContainer.innerHTML = days;

  addListner();
  loadUserEvents();
  markEventsOnCalendar();
}

// Funktionen zum Hinzufügen von Monat und Jahr auf die Vor- und Zurück-Button
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

// Funktion zum Hinzufügen von Event-Listenern
function addListner() {
  // Alle Tage auswählen
  const days = document.querySelectorAll(".day");
  // Für jeden Tag Klick-Listener hinzufügen
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      // Aktiven Tag aktualisieren und Ereignisse aktualisieren
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
     
      days.forEach((day) => {
        day.classList.remove("active");
      });
      // Wenn auf Vorheriges od. Nächstes Datum geklickt wird --> zum entsprechenden Monat
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        // Active Klasse zum angeklickten Tag nach dem Monatswechsel hinzufügen
        setTimeout(() => {
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
        // Active Klasse zum angeklickten Tag nach dem Monatswechsel hinzufügen
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
        // Fügt die active Klasse zum angeklickten Tag hinzu
        e.target.classList.add("active");
      }
    });
  });
}

// Event-Listener für today Button
todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

// Event-Listener für Eingabefeld "Datum"
dateInput.addEventListener("input", (e) => {
  // Nur Zahlen und Schrägstriche im Eingabefeld zulassen
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  // Fügt automatisch Schrägstriche hinzu
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  // Begrenzt die Eingabe auf das Format MM/YYYY
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  // Bearbeite das Löschen von Zeichen im Eingabefeld
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
      initCalendar(); 
      loadUserEvents(); 
      return;
    }
  }
  alert("Invalid Date");
  markEventsOnCalendar();
}

// Funktion zum Abrufen des aktiven Tages
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}

// Funktion zum Aktualisieren der Ereignisse
function updateEvents(selectedDay) {
  let events = "";
  // Durchlauft alle Ereignisse
  eventsArr.forEach((eventObj) => {
    // Überprüft, ob das Ereignis am ausgewählten Tag stattfindet
    if (selectedDay === eventObj.day && month + 1 === eventObj.month && year === eventObj.year) {
      let eventTimeText = eventObj.allDay ? "All Day" : `${eventObj.timeFrom} - ${eventObj.timeTo}`;
      let eventDescriptionText = eventObj.description ? `<div class="event-description">${eventObj.description}</div>` : "";
      // Ereignis HTML hinzufügen
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

  // Falls keine Ereignisse vorhanden sind, entsprechende Meldung anzeigen
  if (events === "") {
    events = `<div class="no-event"><h3>No Events</h3></div>`;
  }

  eventsContainer.innerHTML = events;
}

addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
  resetEventFormData();
});

// Erlaubt 50 characters im Eventtitel
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

// Erlaube nur Zeit im Ereigniszeitraum
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

// Event-Listener für das Hinzufügen eines Ereignisses
addEventSubmit.addEventListener("click", () => {
  const eventTitle = addEventTitle.value;
  const eventDescription = addEventDescription.value;
  const allDay = document.getElementById('allDayEvent').checked;
  let eventTimeFrom = '00:00';
  let eventTimeTo = '23:59';
  
  // Wenn es sich nicht um ein ganztägiges Ereignis handelt
  if (!allDay) {
    eventTimeFrom = addEventFrom.value;
    eventTimeTo = addEventTo.value;
    if (eventTitle === "" || eventDescription === "" || eventTimeFrom === "" || eventTimeTo === "") {
      alert("Bitte füllen Sie alle Felder aus, es sei denn, es ist ein ganztägiges Ereignis.");
      return;
    }
  }

  // Ereignisobjekt erstellen
  const event = {
    title: eventTitle,
    description: eventDescription,
    timeFrom: eventTimeFrom,
    timeTo: eventTimeTo,
    allDay: allDay,
    day: activeDay,
    month: month + 1,
    year: year,
    date: new Date(year, month, activeDay) // Datum des Events
  };

  // Wenn ein Ereignis bearbeitet wird
  if (editingEventId) {
    // Logik zum Updaten eines bestehenden Events
    editEventInFirestore(editingEventId, {
      title: eventTitle,
      description: eventDescription,
      timeFrom: eventTimeFrom,
      timeTo: eventTimeTo,
      allDay: allDay
    });
  } else {
    addEventToFirestore(event);
  }

  // Formular zurücksetzen und das Bearbeiten beenden
  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventDescription.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
  editingEventId = null; // Bearbeitungsmodus verlassen
});

// Funktion zum Hinzufügen eines Ereignisses zu Firestore
function addEventToFirestore(newEvent) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add events.");
    return;
  }

  // Referenz zur "events"-Subkollektion des aktuellen Benutzers erstellen
  const eventsRef = collection(db, "users", user.uid, "events");

  // Neues Ereignis zur Datenbank hinzufügen
  addDoc(eventsRef, newEvent).then(docRef => {
    console.log("Event added with ID: ", docRef.id);
    newEvent.id = docRef.id; // ID zum Ereignis hinzufügen
    eventsArr.push(newEvent); // Ereignis zum Array hinzufügen
    updateEvents(activeDay); // Kalender aktualisieren
    
    const activeDayEl = document.querySelector(".day.active");
    if (!activeDayEl.classList.contains("event")) {
      activeDayEl.classList.add("event");
    }
  }).catch(error => {
    console.error("Error adding event: ", error);
  });

  // Formular zurücksetzen
  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventDescription.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
}

// Event-Listener für das Klicken auf ein Event
eventsContainer.addEventListener("click", (e) => {
  const eventElement = e.target.closest(".event");
  if (eventElement) {
    // Findet das Event-Objekt basierend auf dem Titel und dem aktiven Tag
    const eventTitle = eventElement.querySelector(".event-title").textContent;
    const eventObj = eventsArr.find(event => 
      event.title === eventTitle &&
      event.day === activeDay &&
      event.month === month + 1 &&
      event.year === year
    );

    if (eventObj) {
      setEventFormData(eventObj);
      addEventWrapper.classList.add("active"); // Öffnet das Fenster
    }
  }
});

// Delete-Button aktualisieren, um das Formular zu schließen und zurückzusetzen
document.querySelector(".delete-event-btn").addEventListener("click", () => {
  if (editingEventId && confirm("Are you sure you want to delete this event?")) {
    deleteEventFromFirestore(editingEventId);
    resetEventFormData(); 
  }
});

// Funktion zum Löschen eines Events aus Firestore 
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

      // Entfernt das Event aus dem lokalen Array
      const eventIndex = eventsArr.findIndex(event => event.id === eventId);
      if (eventIndex !== -1) {
        eventsArr.splice(eventIndex, 1);
      }

      // Schließt und leert das Formular nach dem Löschen
      addEventWrapper.classList.remove("active");
      resetEventFormData();

      // Initialisiert den Kalender neu, um Änderungen widerzuspiegeln
      initCalendar();
      markEventsOnCalendar();
    })
    .catch(error => {
      console.error("Error removing event: ", error);
    });
}

// Funktion zum Zurücksetzen des Formulars
function resetEventFormData() {
  addEventTitle.value = "";
  addEventDescription.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
  document.getElementById('allDayEvent').checked = false;
  editingEventId = null;
}

// Funktion zum Setzen der Event-Daten im Formular
function setEventFormData(eventObj) {
  addEventTitle.value = eventObj.title;
  addEventDescription.value = eventObj.description;
  addEventFrom.value = eventObj.timeFrom;
  addEventTo.value = eventObj.timeTo;
  document.getElementById('allDayEvent').checked = eventObj.allDay;
  // Setzen der globalen Variable auf die ID des zu bearbeitenden Events
  editingEventId = eventObj.id;
}

// Funktion um Event zu aktualisieren
function editEventInFirestore(eventId, updatedEvent) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to edit events.");
    return;
  }

  // Referenz zum zu bearbeitenden Ereignis erstellen
  const eventRef = doc(db, "users", user.uid, "events", eventId);
  updateDoc(eventRef, updatedEvent)
    .then(() => {
      console.log("Event successfully updated!");
      loadUserEvents(); 
    })
    .catch(error => {
      console.error("Error updating event: ", error);
    });
}

//Navbar

const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text");


toggle.addEventListener("click" , () =>{
    sidebar.classList.toggle("close");
})

searchBtn.addEventListener("click" , () =>{
    sidebar.classList.remove("close");
})

modeSwitch.addEventListener("click" , () =>{
    body.classList.toggle("dark");
    
    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
    }else{
        modeText.innerText = "Dark mode";
        
    }
});