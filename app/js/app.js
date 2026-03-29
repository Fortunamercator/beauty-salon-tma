// Telegram WebApp initialization
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    
    // Apply Telegram theme
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('tg-theme-dark');
    }
}

// App State
const state = {
    currentScreen: 'home',
    selectedService: {
        name: 'Маникюр + гель-лак',
        price: 1500
    },
    selectedDate: null,
    selectedTime: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// Screen titles
const screenTitles = {
    home: 'Beauty Studio',
    about: 'Обо мне',
    services: 'Услуги',
    booking: 'Запись',
    portfolio: 'Портфолио',
    reviews: 'Отзывы',
    loyalty: 'Бонусы',
    chat: 'Чат',
    notifications: 'Уведомления'
};

// Navigation
function navigateTo(screenName) {
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const backBtn = document.getElementById('backBtn');
    const headerTitle = document.getElementById('headerTitle');
    
    screens.forEach(screen => screen.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navigation
    const activeNav = document.querySelector(`[data-screen="${screenName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update header
    headerTitle.textContent = screenTitles[screenName] || 'Beauty Studio';
    
    // Show/hide back button
    if (screenName !== 'home') {
        backBtn.style.display = 'flex';
        backBtn.onclick = () => navigateTo('home');
    } else {
        backBtn.style.display = 'none';
    }
    
    state.currentScreen = screenName;
    
    // Initialize specific screens
    if (screenName === 'booking') {
        initCalendar();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Service selection
function selectService(name, price) {
    state.selectedService = { name, price };
    document.getElementById('bookingServiceName').textContent = name;
    document.getElementById('bookingServicePrice').textContent = price.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('summaryTotal').textContent = price.toLocaleString('ru-RU') + ' ₽';
    navigateTo('booking');
}

// Calendar
const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function initCalendar() {
    renderCalendar();
    initTimeSlots();
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonth = document.getElementById('calendarMonth');
    
    calendarMonth.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
    
    const firstDay = new Date(state.currentYear, state.currentMonth, 1);
    const lastDay = new Date(state.currentYear, state.currentMonth + 1, 0);
    const today = new Date();
    
    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;
    
    let html = '';
    
    // Empty cells
    for (let i = 0; i < startingDay; i++) {
        html += '<button class="calendar-day empty"></button>';
    }
    
    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(state.currentYear, state.currentMonth, day);
        const isPast = date < today && date.toDateString() !== today.toDateString();
        const isAvailable = !isPast && Math.random() > 0.3; // Simulate availability
        
        let classes = 'calendar-day';
        if (isPast) classes += ' disabled';
        else if (isAvailable) classes += ' available';
        
        if (state.selectedDate && 
            state.selectedDate.getDate() === day && 
            state.selectedDate.getMonth() === state.currentMonth &&
            state.selectedDate.getFullYear() === state.currentYear) {
            classes += ' selected';
        }
        
        html += `<button class="${classes}" data-day="${day}" ${isPast ? 'disabled' : ''}>${day}</button>`;
    }
    
    calendarDays.innerHTML = html;
    
    // Add click handlers
    calendarDays.querySelectorAll('.calendar-day:not(.disabled):not(.empty)').forEach(btn => {
        btn.addEventListener('click', () => selectDate(parseInt(btn.dataset.day)));
    });
}

function selectDate(day) {
    state.selectedDate = new Date(state.currentYear, state.currentMonth, day);
    renderCalendar();
    updateBookingSummary();
}

function prevMonth() {
    state.currentMonth--;
    if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    state.currentMonth++;
    if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    }
    renderCalendar();
}

// Time slots
function initTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (!slot.classList.contains('available')) return;
            
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            state.selectedTime = slot.dataset.time;
            updateBookingSummary();
        });
    });
}

function updateBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (state.selectedDate && state.selectedTime) {
        summary.style.display = 'block';
        document.getElementById('summaryDate').textContent = formatDate(state.selectedDate);
        document.getElementById('summaryTime').textContent = state.selectedTime;
        confirmBtn.disabled = false;
    } else {
        summary.style.display = 'none';
        confirmBtn.disabled = true;
    }
}

function formatDate(date) {
    const day = date.getDate();
    const month = monthNames[date.getMonth()].toLowerCase();
    return `${day} ${month}`;
}

// Booking confirmation
function confirmBooking() {
    const modal = document.getElementById('successModal');
    document.getElementById('modalDate').textContent = formatDate(state.selectedDate);
    document.getElementById('modalTime').textContent = state.selectedTime;
    modal.classList.add('active');
    
    // Telegram haptic feedback
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
    navigateTo('home');
    
    // Reset booking state
    state.selectedDate = null;
    state.selectedTime = null;
}

// Services filter
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        const services = document.querySelectorAll('.service-card');
        
        services.forEach(service => {
            if (category === 'all' || service.dataset.category === category) {
                service.style.display = 'block';
            } else {
                service.style.display = 'none';
            }
        });
    });
});

// Portfolio filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const items = document.querySelectorAll('.portfolio-item');
        
        items.forEach(item => {
            if (filter === 'all' || item.dataset.filter === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Chat
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const text = input.value.trim();
    
    if (!text) return;
    
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const messageHtml = `
        <div class="message sent">
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    messages.insertAdjacentHTML('beforeend', messageHtml);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Simulate response
    setTimeout(() => {
        const responses = [
            'Хорошо, записала вас!',
            'Отлично, жду вас!',
            'Конечно, сделаем!',
            'Да, это возможно 😊'
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const responseHtml = `
            <div class="message received">
                <div class="message-content">
                    <p>${response}</p>
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        
        messages.insertAdjacentHTML('beforeend', responseHtml);
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle Enter key in chat
document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set initial screen
    navigateTo('home');
    
    // Initialize notifications button
    document.getElementById('notificationsBtn').addEventListener('click', () => {
        navigateTo('notifications');
    });
});

// Handle back button on mobile
if (tg) {
    tg.BackButton.onClick(() => {
        if (state.currentScreen !== 'home') {
            navigateTo('home');
        }
    });
}
