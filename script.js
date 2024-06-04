document.getElementById('saveEventButton').addEventListener('click', saveEvent);
document.getElementById('upcomingEventsBtn').addEventListener('click', () => displayEvents('upcoming'));
document.getElementById('completedEventsBtn').addEventListener('click', () => displayEvents('completed'));
document.getElementById('addEventBtn').addEventListener('click', showEventForm);
document.getElementById('searchButton').addEventListener('click', searchEvents);

let editEventId = null;

function saveEvent() {
    const eventName = document.getElementById('eventName').value;
    const speakerName = document.getElementById('speakerName').value;
    const speakerEmail = document.getElementById('speakerEmail').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const eventDescription = document.getElementById('eventDescription').value;

    if (!eventName || !speakerName || !speakerEmail || !startTime || !endTime) {
        alert('Please fill in all the fields.');
        return;
    }

    const events = JSON.parse(localStorage.getItem('events')) || [];
    
    const event = {
        id: editEventId !== null ? editEventId : Date.now(), // Ensure unique IDs
        name: eventName,
        speaker: speakerName,
        email: speakerEmail,
        start: startTime,
        end: endTime,
        description: eventDescription
    };

    if (editEventId !== null) {
        const index = events.findIndex(e => e.id === editEventId);
        if (index !== -1) {
            events[index] = event;
        }
    } else {
        events.push(event);
    }
    
    localStorage.setItem('events', JSON.stringify(events));

    displayEvents('upcoming');
    updateEventCounts();
    clearInputs();
    editEventId = null;
}

function displayEvents(type) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';

    const now = new Date().toISOString();

    events.forEach((event, index) => {
        if (type === 'upcoming' && event.start > now) {
            // Display upcoming events
            const row = createEventRow(event, index + 1, type);
            eventsList.appendChild(row);
        } else if (type === 'completed' && event.end <= now) {
            // Move completed events to the completed events list
            const completedEvents = JSON.parse(localStorage.getItem('completedEvents')) || [];
            completedEvents.push(event);
            localStorage.setItem('completedEvents', JSON.stringify(completedEvents));
        }
    });

    // Refresh the upcoming events list
    if (type === 'upcoming') {
        updateEventCounts();
    }

    document.getElementById('eventsTitle').innerText = type === 'upcoming' ? 'Upcoming Events' : 'Completed Events';
    document.getElementById('eventsContainer').style.display = 'block';
    document.getElementById('inputContainer').style.display = 'none';
}

function createEventRow(event, index, type) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${index}</td>
        <td><b>${event.name}</b></td>
        <td><b>${event.speaker}</b></td>
        <td>${event.email}</td>
        <td>${new Date(event.start).toLocaleString()}</td>
        <td>${new Date(event.end).toLocaleString()}</td>
        <td>${event.description}</td>
        <td>
            ${type === 'upcoming' ? `<button class="complete-button" onclick="markCompleted(${event.id})">Mark Completed</button>` : ''}
            <button class="edit-button" onclick="editEvent(${event.id})">Edit</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
        </td>
    `;
    return row;
}

function deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const updatedEvents = events.filter(event => event.id !== id);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        displayEvents('upcoming');
        updateEventCounts();
    }
}

function editEvent(id) {
    editEventId = id;
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events.find(event => event.id === id);

    document.getElementById('eventName').value = event.name;
    document.getElementById('speakerName').value = event.speaker;
    document.getElementById('speakerEmail').value = event.email;
    document.getElementById('startTime').value = event.start;
    document.getElementById('endTime').value = event.end;
    document.getElementById('eventDescription').value = event.description;

    showEventForm();
}

function showEventForm() {
    document.getElementById('eventsContainer').style.display = 'none';
    document.getElementById('inputContainer').style.display = 'flex';
}

function clearInputs() {
    document.getElementById('eventName').value = '';
    document.getElementById('speakerName').value = '';
    document.getElementById('speakerEmail').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('eventDescription').value = '';
}

function searchEvents() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';

    const filteredEvents = events.filter(event => {
        return event.name.toLowerCase().includes(query) ||
               event.speaker.toLowerCase().includes(query) ||
               event.email.toLowerCase().includes(query) ||
               event.description.toLowerCase().includes(query);
    });

    filteredEvents.forEach((event, index) => {
        const row = createEventRow(event, index + 1, 'search');
        eventsList.appendChild(row);
    });

    document.getElementById('eventsTitle').innerText = 'Search Results';
    document.getElementById('eventsContainer').style.display = 'block';
    document.getElementById('inputContainer').style.display = 'none';
}

function updateEventCounts() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const now = new Date().toISOString();

    const totalCompleted = events.filter(event => event.end <= now).length;
    const totalPending = events.filter(event => event.start > now).length;

    document.getElementById('totalCompleted').innerText = `Total Completed Events: ${totalCompleted}`;
    document.getElementById('totalPending').innerText = `Total Pending Events: ${totalPending}`;
}

function markCompleted(id) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
        // Mark the event as completed
        events[index].end = new Date().toISOString();
        
        // Move the completed event to the completed events list
        const completedEvent = events.splice(index, 1)[0];
        const completedEvents = JSON.parse(localStorage.getItem('completedEvents')) || [];
        completedEvents.push(completedEvent);
        localStorage.setItem('completedEvents', JSON.stringify(completedEvents));
        
        // Refresh the displayed events
        displayEvents('upcoming');
        displayEvents('completed');
        updateEventCounts();
    }
}


function markUpcoming(id) {
    const completedEvents = JSON.parse(localStorage.getItem('completedEvents')) || [];
    const index = completedEvents.findIndex(event => event.id === id);
    if (index !== -1) {
        // Remove the event from the completed events list
        const upcomingEvent = completedEvents.splice(index, 1)[0];
        localStorage.setItem('completedEvents', JSON.stringify(completedEvents));
        
        // Move the event back to the upcoming events list
        const upcomingEvents = JSON.parse(localStorage.getItem('events')) || [];
        upcomingEvents.push(upcomingEvent);
        localStorage.setItem('events', JSON.stringify(upcomingEvents));
        
        // Refresh the displayed events
        displayEvents('upcoming');
        displayEvents('completed');
        updateEventCounts();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if there are any completed events that need to be moved
    displayEvents('completed');
    displayEvents('upcoming');
    updateEventCounts();

    // Set up an interval to check for completed events every minute
    setInterval(() => {
        displayEvents('completed');
    }, 60000);
});

