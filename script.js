const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKx4D_HEzMWIJORH9R2rnTcSiiMDPgXijvliOc_12wjSM5vpAu-zc-sZK-MOrRcRIbYqHfu_NaNp1M/pub?output=csv';

document.addEventListener('DOMContentLoaded', () => {
    const landingView = document.getElementById('landing-view');
    const dashboardView = document.getElementById('dashboard-view');
    const homeBtn = document.getElementById('home-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {
        fetchStudentData(studentId);
    } else {
        showView(landingView);
    }

    homeBtn.addEventListener('click', () => {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl}, '', newUrl);
        showView(landingView);
    });

    function showView(viewToShow) {
        landingView.classList.remove('active');
        dashboardView.classList.remove('active');
        landingView.classList.add('hidden');
        dashboardView.classList.add('hidden');

        viewToShow.classList.remove('hidden');
        setTimeout(() => {
            viewToShow.classList.add('active');
        }, 10);
    }

    function fetchStudentData(id) {
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                const student = data.find(row => String(row.Student_ID) === String(id));
                
                if(student) {
                    loadDashboard(student);
                } else {
                    alert("Student ID not found in database. Redirecting to home page.");
                    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                    window.history.pushState({path:newUrl}, '', newUrl);
                    showView(landingView);
                }
            },
            error: function(err) {
                console.error(err);
                alert("Failed to load data. Please check your network connection and ensure the Google Sheet is public.");
                showView(landingView);
            }
        });
    }

    function loadDashboard(student) {
        document.getElementById('student-name').textContent = student.Name;

        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = ''; 
        
        const eventKeys = ['Event_1', 'Event_2', 'Event_3', 'Event_4'];
        let hasEvents = false;
        eventKeys.forEach(key => {
            if(student[key] && student[key].trim() !== '') {
                hasEvents = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="event-name">${student[key]}</span>`;
                eventsList.appendChild(li);
            }
        });
        
        if(!hasEvents) {
            eventsList.innerHTML = '<li><span class="event-name" style="color:#777">No registered events.</span></li>';
        }

        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';
        if(student.Rank_or_Result && student.Rank_or_Result.trim() !== '') {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="event-name">Overall Status / Result</span>
                <span class="result-rank">${student.Rank_or_Result}</span>
            `;
            resultsList.appendChild(li);
        } else {
            resultsList.innerHTML = '<li><span class="event-name" style="color:#777">No results published yet.</span></li>';
        }

        showView(dashboardView);
    }
});
