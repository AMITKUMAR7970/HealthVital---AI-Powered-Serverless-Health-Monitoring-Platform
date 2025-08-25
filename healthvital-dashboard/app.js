// Application state and configuration
const HealthVitalApp = {
    // Patient data from the provided JSON
    patientData: {
        name: "Sarah Johnson",
        age: 34,
        medicalId: "HV-2024-001",
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=150&h=150&fit=crop&crop=face",
        emergencyContact: {
            name: "John Johnson",
            phone: "(555) 123-4567",
            relationship: "Spouse"
        },
        medications: ["Lisinopril 10mg", "Metformin 500mg", "Vitamin D3"],
        conditions: ["Hypertension", "Type 2 Diabetes"]
    },

    // Current vital signs
    vitals: {
        heartRate: {
            current: 72,
            history: [68, 70, 72, 75, 73, 71, 69, 72, 74, 71],
            normal_range: [60, 100],
            unit: "BPM",
            trend: "stable"
        },
        bloodPressure: {
            systolic: 125,
            diastolic: 82,
            history: [
                {sys: 122, dia: 80}, {sys: 125, dia: 82}, {sys: 128, dia: 85},
                {sys: 124, dia: 81}, {sys: 126, dia: 83}, {sys: 123, dia: 79},
                {sys: 127, dia: 84}, {sys: 125, dia: 82}, {sys: 124, dia: 80}
            ],
            normal_range: {systolic: [90, 120], diastolic: [60, 80]},
            unit: "mmHg",
            trend: "slightly_elevated"
        },
        temperature: {
            current: 98.4,
            history: [98.2, 98.4, 98.1, 98.3, 98.5, 98.2, 98.4, 98.3, 98.1],
            normal_range: [97.0, 99.5],
            unit: "°F",
            trend: "normal"
        },
        oxygenSaturation: {
            current: 98,
            history: [97, 98, 99, 98, 97, 98, 99, 98, 98],
            normal_range: [95, 100],
            unit: "%",
            trend: "normal"
        }
    },

    // Charts instances
    charts: {
        heartRate: null,
        bloodPressure: null,
        temperature: null,
        oxygen: null,
        detailed: null
    },

    // Update intervals
    intervals: {
        vitals: null,
        time: null
    },

    // Current active section
    currentSection: 'dashboard'
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeCharts();
    startRealTimeUpdates();
    updateDeviceStatuses();
    setupModal();
    showSection('dashboard'); // Show default section
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Vital cards click for detailed view
    document.querySelectorAll('.vital-card').forEach(card => {
        card.addEventListener('click', openVitalModal);
    });

    // Modal controls
    const closeBtn = document.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    const modal = document.getElementById('vital-detail-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    // Chart period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', handlePeriodChange);
    });

    // Add device button
    const addDeviceBtn = document.querySelector('.add-device-btn');
    if (addDeviceBtn) {
        addDeviceBtn.addEventListener('click', handleAddDevice);
    }

    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Notifications
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        notifications.addEventListener('click', handleNotifications);
    }

    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', handleUserProfile);
    }
}

function handleNavigation(e) {
    e.preventDefault();
    
    // Update active navigation item
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    e.currentTarget.closest('.nav-item').classList.add('active');
    
    // Get section from href
    const href = e.currentTarget.getAttribute('href');
    const section = href.replace('#', '');
    
    // Show the corresponding section
    showSection(section);
    
    console.log('Navigation to:', section);
}

function showSection(sectionName) {
    HealthVitalApp.currentSection = sectionName;
    
    // Hide all sections first
    document.querySelectorAll('.dashboard-section, .vitals-section, .analytics-section, .alerts-section-page, .devices-section-page, .settings-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create sections if they don't exist
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Clear existing content except dashboard
    const existingSections = mainContent.querySelectorAll('.section:not(.dashboard-section)');
    existingSections.forEach(section => section.remove());
    
    switch (sectionName) {
        case 'dashboard':
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) {
                dashboardSection.style.display = 'block';
            }
            break;
            
        case 'vitals':
            createVitalsSection();
            break;
            
        case 'analytics':
            createAnalyticsSection();
            break;
            
        case 'alerts':
            createAlertsSection();
            break;
            
        case 'devices':
            createDevicesSection();
            break;
            
        case 'settings':
            createSettingsSection();
            break;
            
        default:
            // Show dashboard by default
            const defaultSection = document.getElementById('dashboard');
            if (defaultSection) {
                defaultSection.style.display = 'block';
            }
    }
}

function createVitalsSection() {
    const mainContent = document.querySelector('.main-content');
    const section = document.createElement('section');
    section.className = 'section vitals-section';
    section.innerHTML = `
        <div class="section-header">
            <h1>Patient Vitals</h1>
            <p class="section-subtitle">Detailed vital signs monitoring and trends</p>
        </div>
        <div class="vitals-detailed-grid">
            <div class="card">
                <div class="card__body">
                    <h3>Heart Rate Trends</h3>
                    <div class="chart-container" style="position: relative; height: 200px;">
                        <canvas id="vitals-hr-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3>Blood Pressure Trends</h3>
                    <div class="chart-container" style="position: relative; height: 200px;">
                        <canvas id="vitals-bp-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(section);
    
    // Initialize charts for this section
    setTimeout(() => initializeVitalsCharts(), 100);
}

function createAnalyticsSection() {
    const mainContent = document.querySelector('.main-content');
    const section = document.createElement('section');
    section.className = 'section analytics-section';
    section.innerHTML = `
        <div class="section-header">
            <h1>Health Analytics</h1>
            <p class="section-subtitle">AI-powered insights and health predictions</p>
        </div>
        <div class="analytics-grid">
            <div class="card">
                <div class="card__body">
                    <h3>Health Risk Assessment</h3>
                    <div class="risk-assessment">
                        <div class="risk-score-large">
                            <span class="score">65</span>
                            <span class="risk-label">Moderate Risk</span>
                        </div>
                        <div class="risk-factors">
                            <div class="risk-factor">
                                <span>Blood Pressure</span>
                                <div class="risk-bar">
                                    <div class="risk-fill" style="width: 70%"></div>
                                </div>
                            </div>
                            <div class="risk-factor">
                                <span>Heart Rate Variability</span>
                                <div class="risk-bar">
                                    <div class="risk-fill" style="width: 45%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3>Predictive Analytics</h3>
                    <div class="predictions-detailed">
                        <div class="prediction">
                            <span class="condition">Cardiovascular Event</span>
                            <span class="probability">15% risk</span>
                            <span class="timeframe">Next 6 months</span>
                        </div>
                        <div class="prediction">
                            <span class="condition">Diabetes Complication</span>
                            <span class="probability">8% risk</span>
                            <span class="timeframe">Next 12 months</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(section);
}

function createAlertsSection() {
    const mainContent = document.querySelector('.main-content');
    const section = document.createElement('section');
    section.className = 'section alerts-section-page';
    section.innerHTML = `
        <div class="section-header">
            <h1>Alerts & Notifications</h1>
            <p class="section-subtitle">Manage all health alerts and system notifications</p>
        </div>
        <div class="alerts-management">
            <div class="card">
                <div class="card__body">
                    <h3>Active Alerts</h3>
                    <div class="alert-item critical">
                        <i class="fas fa-exclamation-circle"></i>
                        <div class="alert-content">
                            <p>Blood pressure reading above normal range</p>
                            <small>5 minutes ago</small>
                        </div>
                        <button class="btn btn--sm btn--outline">Acknowledge</button>
                    </div>
                    <div class="alert-item medium">
                        <i class="fas fa-pills"></i>
                        <div class="alert-content">
                            <p>Time to take Lisinopril medication</p>
                            <small>10 minutes ago</small>
                        </div>
                        <button class="btn btn--sm btn--outline">Mark Taken</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3>Alert Settings</h3>
                    <div class="alert-settings">
                        <div class="setting-item">
                            <label class="form-label">High Blood Pressure Alert</label>
                            <select class="form-control">
                                <option>Immediate</option>
                                <option>5 minutes</option>
                                <option>15 minutes</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label class="form-label">Medication Reminders</label>
                            <select class="form-control">
                                <option>Enabled</option>
                                <option>Disabled</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(section);
}

function createDevicesSection() {
    const mainContent = document.querySelector('.main-content');
    const section = document.createElement('section');
    section.className = 'section devices-section-page';
    section.innerHTML = `
        <div class="section-header">
            <h1>Connected Devices</h1>
            <p class="section-subtitle">Manage your IoT health monitoring devices</p>
        </div>
        <div class="devices-management">
            <div class="card">
                <div class="card__body">
                    <h3>Device Status</h3>
                    <div class="device-grid">
                        <div class="device-card connected">
                            <div class="device-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h4>Apple Watch Series 9</h4>
                            <div class="device-status">Connected</div>
                            <div class="device-metrics">
                                <span>Battery: 85%</span>
                                <span>Last sync: 2 min ago</span>
                            </div>
                        </div>
                        <div class="device-card connected">
                            <div class="device-icon">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h4>Omron BP Monitor</h4>
                            <div class="device-status">Connected</div>
                            <div class="device-metrics">
                                <span>Battery: 92%</span>
                                <span>Last sync: 15 min ago</span>
                            </div>
                        </div>
                        <div class="device-card disconnected">
                            <div class="device-icon">
                                <i class="fas fa-circle"></i>
                            </div>
                            <h4>Pulse Oximeter</h4>
                            <div class="device-status">Disconnected</div>
                            <div class="device-metrics">
                                <span>Battery: 45%</span>
                                <span>Last sync: 2 hours ago</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn--primary mt-16">
                        <i class="fas fa-plus"></i>
                        Add New Device
                    </button>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(section);
}

function createSettingsSection() {
    const mainContent = document.querySelector('.main-content');
    const section = document.createElement('section');
    section.className = 'section settings-section';
    section.innerHTML = `
        <div class="section-header">
            <h1>Settings</h1>
            <p class="section-subtitle">Configure your HealthVital preferences</p>
        </div>
        <div class="settings-grid">
            <div class="card">
                <div class="card__body">
                    <h3>Profile Settings</h3>
                    <div class="form-group">
                        <label class="form-label">Display Name</label>
                        <input type="text" class="form-control" value="Dr. Smith">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Notifications</label>
                        <select class="form-control">
                            <option>All notifications</option>
                            <option>Critical only</option>
                            <option>Disabled</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3>Data & Privacy</h3>
                    <div class="privacy-settings">
                        <div class="privacy-item">
                            <span>Data retention period</span>
                            <select class="form-control">
                                <option>1 year</option>
                                <option>2 years</option>
                                <option>5 years</option>
                            </select>
                        </div>
                        <div class="privacy-item">
                            <span>Share anonymized data for research</span>
                            <label class="toggle">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(section);
}

function initializeCharts() {
    // Chart colors matching the design
    const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
    
    // Heart Rate Chart
    const heartRateCtx = document.getElementById('heart-rate-chart');
    if (heartRateCtx) {
        HealthVitalApp.charts.heartRate = new Chart(heartRateCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(HealthVitalApp.vitals.heartRate.history.length),
                datasets: [{
                    data: HealthVitalApp.vitals.heartRate.history,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: 60,
                        max: 85
                    }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    }

    // Blood Pressure Chart
    const bpCtx = document.getElementById('blood-pressure-chart');
    if (bpCtx) {
        HealthVitalApp.charts.bloodPressure = new Chart(bpCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(HealthVitalApp.vitals.bloodPressure.history.length),
                datasets: [{
                    label: 'Systolic',
                    data: HealthVitalApp.vitals.bloodPressure.history.map(bp => bp.sys),
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }, {
                    label: 'Diastolic',
                    data: HealthVitalApp.vitals.bloodPressure.history.map(bp => bp.dia),
                    borderColor: '#4da6ff',
                    backgroundColor: 'rgba(77, 166, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: 70,
                        max: 140
                    }
                }
            }
        });
    }

    // Temperature Chart
    const tempCtx = document.getElementById('temperature-chart');
    if (tempCtx) {
        HealthVitalApp.charts.temperature = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(HealthVitalApp.vitals.temperature.history.length),
                datasets: [{
                    data: HealthVitalApp.vitals.temperature.history,
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: 97.5,
                        max: 99.0
                    }
                }
            }
        });
    }

    // Oxygen Saturation Chart
    const oxygenCtx = document.getElementById('oxygen-chart');
    if (oxygenCtx) {
        HealthVitalApp.charts.oxygen = new Chart(oxygenCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(HealthVitalApp.vitals.oxygenSaturation.history.length),
                datasets: [{
                    data: HealthVitalApp.vitals.oxygenSaturation.history,
                    borderColor: '#00a86b',
                    backgroundColor: 'rgba(0, 168, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { 
                        display: false,
                        min: 95,
                        max: 100
                    }
                }
            }
        });
    }
}

function initializeVitalsCharts() {
    const hrCtx = document.getElementById('vitals-hr-chart');
    if (hrCtx) {
        new Chart(hrCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(20),
                datasets: [{
                    label: 'Heart Rate (BPM)',
                    data: generateExtendedData(HealthVitalApp.vitals.heartRate, 20),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }

    const bpCtx = document.getElementById('vitals-bp-chart');
    if (bpCtx) {
        new Chart(bpCtx, {
            type: 'line',
            data: {
                labels: generateTimeLabels(20),
                datasets: [{
                    label: 'Systolic',
                    data: HealthVitalApp.vitals.bloodPressure.history.slice(-20).map(bp => bp.sys),
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Diastolic',
                    data: HealthVitalApp.vitals.bloodPressure.history.slice(-20).map(bp => bp.dia),
                    borderColor: '#4da6ff',
                    backgroundColor: 'rgba(77, 166, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }
}

function generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - (i * 5 * 60 * 1000)); // 5-minute intervals
        labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
    }
    return labels;
}

function startRealTimeUpdates() {
    // Update vitals every 5 seconds
    HealthVitalApp.intervals.vitals = setInterval(() => {
        updateVitalSigns();
        updateCharts();
    }, 5000);

    // Update time-related elements every minute
    HealthVitalApp.intervals.time = setInterval(() => {
        updateDeviceStatuses();
    }, 60000);
}

function updateVitalSigns() {
    // Heart Rate simulation (60-100 BPM)
    const heartRate = HealthVitalApp.vitals.heartRate;
    const newHeartRate = heartRate.current + (Math.random() - 0.5) * 4;
    heartRate.current = Math.max(60, Math.min(100, Math.round(newHeartRate)));
    heartRate.history.push(heartRate.current);
    if (heartRate.history.length > 20) heartRate.history.shift();

    // Blood Pressure simulation
    const bp = HealthVitalApp.vitals.bloodPressure;
    bp.systolic += (Math.random() - 0.5) * 6;
    bp.diastolic += (Math.random() - 0.5) * 4;
    bp.systolic = Math.max(90, Math.min(160, Math.round(bp.systolic)));
    bp.diastolic = Math.max(60, Math.min(100, Math.round(bp.diastolic)));
    bp.history.push({sys: bp.systolic, dia: bp.diastolic});
    if (bp.history.length > 20) bp.history.shift();

    // Temperature simulation (97.0-99.5°F)
    const temp = HealthVitalApp.vitals.temperature;
    const newTemp = temp.current + (Math.random() - 0.5) * 0.4;
    temp.current = Math.max(97.0, Math.min(99.5, parseFloat(newTemp.toFixed(1))));
    temp.history.push(temp.current);
    if (temp.history.length > 20) temp.history.shift();

    // Oxygen Saturation simulation (95-100%)
    const oxygen = HealthVitalApp.vitals.oxygenSaturation;
    const newOxygen = oxygen.current + (Math.random() - 0.5) * 2;
    oxygen.current = Math.max(95, Math.min(100, Math.round(newOxygen)));
    oxygen.history.push(oxygen.current);
    if (oxygen.history.length > 20) oxygen.history.shift();

    // Update DOM
    updateVitalDisplays();
    checkAlerts();
}

function updateVitalDisplays() {
    // Update heart rate
    const heartRateEl = document.getElementById('heart-rate-value');
    if (heartRateEl) {
        heartRateEl.textContent = HealthVitalApp.vitals.heartRate.current;
        animateValueChange(heartRateEl);
    }

    // Update blood pressure
    const bpSysEl = document.getElementById('bp-systolic');
    const bpDiaEl = document.getElementById('bp-diastolic');
    if (bpSysEl && bpDiaEl) {
        bpSysEl.textContent = HealthVitalApp.vitals.bloodPressure.systolic;
        bpDiaEl.textContent = HealthVitalApp.vitals.bloodPressure.diastolic;
        animateValueChange(bpSysEl);
        animateValueChange(bpDiaEl);
    }

    // Update temperature
    const tempEl = document.getElementById('temperature-value');
    if (tempEl) {
        tempEl.textContent = HealthVitalApp.vitals.temperature.current;
        animateValueChange(tempEl);
    }

    // Update oxygen saturation
    const oxygenEl = document.getElementById('oxygen-value');
    if (oxygenEl) {
        oxygenEl.textContent = HealthVitalApp.vitals.oxygenSaturation.current;
        animateValueChange(oxygenEl);
    }
}

function animateValueChange(element) {
    element.style.transform = 'scale(1.1)';
    element.style.color = 'var(--color-primary)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

function updateCharts() {
    // Update all mini charts with new data
    Object.keys(HealthVitalApp.charts).forEach(chartKey => {
        const chart = HealthVitalApp.charts[chartKey];
        if (chart && chartKey !== 'detailed') {
            const vitalData = HealthVitalApp.vitals[chartKey];
            if (vitalData) {
                if (chartKey === 'bloodPressure') {
                    chart.data.datasets[0].data = vitalData.history.map(bp => bp.sys);
                    chart.data.datasets[1].data = vitalData.history.map(bp => bp.dia);
                } else {
                    chart.data.datasets[0].data = vitalData.history;
                }
                chart.data.labels = generateTimeLabels(vitalData.history.length);
                chart.update('none');
            }
        }
    });
}

function checkAlerts() {
    const vitals = HealthVitalApp.vitals;
    const alerts = [];

    // Check heart rate
    if (vitals.heartRate.current > 100) {
        alerts.push({
            type: 'critical',
            message: 'High heart rate detected: ' + vitals.heartRate.current + ' BPM',
            time: 'Just now'
        });
    } else if (vitals.heartRate.current < 60) {
        alerts.push({
            type: 'warning',
            message: 'Low heart rate detected: ' + vitals.heartRate.current + ' BPM',
            time: 'Just now'
        });
    }

    // Check blood pressure
    if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) {
        alerts.push({
            type: 'critical',
            message: 'High blood pressure: ' + vitals.bloodPressure.systolic + '/' + vitals.bloodPressure.diastolic + ' mmHg',
            time: 'Just now'
        });
    }

    // Check temperature
    if (vitals.temperature.current > 100.4) {
        alerts.push({
            type: 'critical',
            message: 'Fever detected: ' + vitals.temperature.current + '°F',
            time: 'Just now'
        });
    }

    // Check oxygen saturation
    if (vitals.oxygenSaturation.current < 95) {
        alerts.push({
            type: 'critical',
            message: 'Low oxygen saturation: ' + vitals.oxygenSaturation.current + '%',
            time: 'Just now'
        });
    }

    // Update alerts in UI if any new critical alerts
    if (alerts.length > 0) {
        updateAlertsDisplay(alerts);
    }
}

function updateAlertsDisplay(newAlerts) {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    newAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.insertBefore(alertElement, alertsList.firstChild);
        
        // Remove old alerts if too many
        if (alertsList.children.length > 5) {
            alertsList.removeChild(alertsList.lastChild);
        }
    });

    // Update notification badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + newAlerts.length;
    }
}

function createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${alert.type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <div class="alert-content">
            <p>${alert.message}</p>
            <small>${alert.time}</small>
        </div>
    `;
    return alertDiv;
}

function updateDeviceStatuses() {
    // Simulate device status updates
    console.log('Updating device statuses...');
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('vital-detail-modal');
    if (!modal) return;

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function openVitalModal(e) {
    const vitalType = e.currentTarget.dataset.vital;
    if (!vitalType) return;

    const modal = document.getElementById('vital-detail-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !modalTitle) return;

    // Set modal title
    const titles = {
        heartRate: 'Heart Rate Details',
        bloodPressure: 'Blood Pressure Details',
        temperature: 'Temperature Details',
        oxygenSaturation: 'Oxygen Saturation Details'
    };
    
    modalTitle.textContent = titles[vitalType] || 'Vital Details';
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Create detailed chart
    setTimeout(() => createDetailedChart(vitalType), 100);
}

function closeModal() {
    const modal = document.getElementById('vital-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        
        // Destroy detailed chart
        if (HealthVitalApp.charts.detailed) {
            HealthVitalApp.charts.detailed.destroy();
            HealthVitalApp.charts.detailed = null;
        }
    }
}

function createDetailedChart(vitalType) {
    const ctx = document.getElementById('detailed-chart');
    if (!ctx) return;

    const vitalData = HealthVitalApp.vitals[vitalType];
    if (!vitalData) return;

    // Generate extended data for detailed view
    const extendedData = generateExtendedData(vitalData, 50);
    const labels = generateDetailedTimeLabels(50);

    let chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: getVitalLabel(vitalType),
                data: extendedData,
                borderColor: getVitalColor(vitalType),
                backgroundColor: getVitalColor(vitalType, 0.1),
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `${getVitalLabel(vitalType)} (${vitalData.unit})`
                    }
                }
            }
        }
    };

    // Special handling for blood pressure (dual line chart)
    if (vitalType === 'bloodPressure') {
        chartConfig.data.datasets = [{
            label: 'Systolic',
            data: extendedData.map(bp => bp.sys),
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2
        }, {
            label: 'Diastolic',
            data: extendedData.map(bp => bp.dia),
            borderColor: '#4da6ff',
            backgroundColor: 'rgba(77, 166, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2
        }];
    }

    HealthVitalApp.charts.detailed = new Chart(ctx, chartConfig);
}

function generateExtendedData(vitalData, count) {
    const data = [...vitalData.history];
    const current = vitalData.current;
    
    // Generate additional historical data points
    while (data.length < count) {
        if (vitalData.unit === 'mmHg') {
            // Blood pressure
            const lastBP = data[data.length - 1] || {sys: current.systolic || 125, dia: current.diastolic || 82};
            const newSys = lastBP.sys + (Math.random() - 0.5) * 8;
            const newDia = lastBP.dia + (Math.random() - 0.5) * 6;
            data.push({
                sys: Math.max(90, Math.min(160, Math.round(newSys))),
                dia: Math.max(60, Math.min(100, Math.round(newDia)))
            });
        } else {
            // Other vitals
            const last = data[data.length - 1] || current;
            let variation = 0;
            let min = 0, max = 0;
            
            switch (vitalData.unit) {
                case 'BPM':
                    variation = 4;
                    min = 60;
                    max = 100;
                    break;
                case '°F':
                    variation = 0.4;
                    min = 97.0;
                    max = 99.5;
                    break;
                case '%':
                    variation = 2;
                    min = 95;
                    max = 100;
                    break;
            }
            
            const newValue = last + (Math.random() - 0.5) * variation;
            data.push(Math.max(min, Math.min(max, vitalData.unit === '°F' ? parseFloat(newValue.toFixed(1)) : Math.round(newValue))));
        }
    }
    
    return data.slice(-count);
}

function generateDetailedTimeLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - (i * 10 * 60 * 1000)); // 10-minute intervals
        labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
    }
    return labels;
}

function getVitalLabel(vitalType) {
    const labels = {
        heartRate: 'Heart Rate',
        bloodPressure: 'Blood Pressure',
        temperature: 'Temperature',
        oxygenSaturation: 'Oxygen Saturation'
    };
    return labels[vitalType] || 'Vital Sign';
}

function getVitalColor(vitalType, alpha = 1) {
    const colors = {
        heartRate: alpha === 1 ? '#dc3545' : `rgba(220, 53, 69, ${alpha})`,
        bloodPressure: alpha === 1 ? '#0066cc' : `rgba(0, 102, 204, ${alpha})`,
        temperature: alpha === 1 ? '#fd7e14' : `rgba(253, 126, 20, ${alpha})`,
        oxygenSaturation: alpha === 1 ? '#00a86b' : `rgba(0, 168, 107, ${alpha})`
    };
    return colors[vitalType] || (alpha === 1 ? '#6c757d' : `rgba(108, 117, 125, ${alpha})`);
}

function handlePeriodChange(e) {
    e.preventDefault();
    
    // Update active period button
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    console.log('Period changed to:', e.target.dataset.period);
}

function handleAddDevice() {
    alert('Add New Device: This would integrate with IoT device pairing APIs to connect new health monitoring devices to your HealthVital dashboard.');
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear intervals
        Object.values(HealthVitalApp.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        alert('Logout successful! In a production app, you would be redirected to the login page.');
    }
}

function handleNotifications() {
    alert('Notifications: You have 3 new health alerts. Click on individual alerts in the dashboard to view details and take action.');
}

function handleUserProfile() {
    alert('User Profile: Access your account settings, medical history, and preferences here. This would open a user management interface.');
}

// Cleanup function for when the page is unloaded
window.addEventListener('beforeunload', function() {
    Object.values(HealthVitalApp.intervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthVitalApp;
}