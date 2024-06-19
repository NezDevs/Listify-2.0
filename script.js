document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu a, .private a, .others a');
    const sections = document.querySelectorAll('.main-content');
    const cards = document.querySelectorAll('.cards .card');
    const dashboardContent = document.getElementById('dashboard-content');
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    let lastEditedDates = JSON.parse(localStorage.getItem('lastEditedDates')) || {
        life: 'Dec 30, 2023',
        work: 'Apr 29, 2023',
        goals: 'Dec 30, 2023',
        plans: 'Dec 30, 2023',
        calendar: 'Mar 4',
        trash: 'Apr 3'
    };

    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [
        { section: 'life', date: 'Dec 30, 2023' },
        { section: 'work', date: 'Apr 29, 2023' },
        { section: 'goals', date: 'Dec 30, 2023' },
        { section: 'today-plans', date: 'Dec 30, 2023' },
        { section: 'calendar', date: 'Mar 4' },
        { section: 'trash', date: 'Apr 3' }
    ];

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    function showSection(sectionId) {
        sections.forEach(section => section.style.display = 'none');
        const section = document.getElementById(`${sectionId}-content`);
        if (section) {
            section.style.display = 'block';
        }
        updateRecentlyViewed(sectionId);
        saveToLocalStorage();
    }

    function updateRecentlyViewed(sectionId) {
        const currentDate = formatDate(new Date());
        const index = recentlyViewed.findIndex(item => item.section === sectionId);
        if (index !== -1) {
            recentlyViewed[index].date = currentDate;
        } else {
            recentlyViewed.unshift({ section: sectionId, date: currentDate });
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('lastEditedDates', JSON.stringify(lastEditedDates));
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));

        // Save tasks for each section
        ['life', 'work', 'goals', 'plans'].forEach(sectionId => {
            const listContainer = document.getElementById(`${sectionId}-content`).querySelector('#list-container');
            localStorage.setItem(`${sectionId}Tasks`, listContainer.innerHTML);
        });

        console.log('Saved to localStorage successfully:', lastEditedDates, recentlyViewed);
    }

    function handleLinkClick(e) {
        e.preventDefault();
        menuLinks.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        const sectionId = this.getAttribute('data-section');
        showSection(sectionId);
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });

    function appendCardsToDashboard() {
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.remove('card');
            clone.classList.add('dashboard-card');
            dashboardContent.appendChild(clone);
        });
    }

    appendCardsToDashboard();

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const sectionId = card.getAttribute('data-section');
            showSection(sectionId);
            const currentDate = formatDate(new Date());
            lastEditedDates[sectionId] = currentDate;
            const dateSpan = card.querySelector('span');
            if (dateSpan) {
                dateSpan.textContent = currentDate;
            }

            const menuLink = document.querySelector(`.menu a[data-section="${sectionId}"]`);
            if (menuLink) {
                menuLinks.forEach(item => item.classList.remove('active'));
                menuLink.classList.add('active');
            }

            saveToLocalStorage();
        });
    });

    showSection('home');

    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('closed');

        const mainContents = document.querySelectorAll('.main-content');
        mainContents.forEach(function(content) {
            if (sidebar.classList.contains('closed')) {
                content.style.marginLeft = '0';
            } else {
                content.style.marginLeft = '220px';
            }
        });
    });

    function initializeSection(sectionId) {
        const sectionContent = document.getElementById(`${sectionId}-content`);
        const listContainer = sectionContent.querySelector('#list-container');
        const completedContainer = sectionContent.querySelector('#completed-container');
        const completedHeading = sectionContent.querySelector('#completed-heading');

        function updateCompletedVisibility() {
            const completedItems = completedContainer.querySelectorAll('li');
            if (completedItems.length > 0) {
                completedContainer.classList.remove('hidden');
                completedHeading.style.display = 'block';
            } else {
                completedContainer.classList.add('hidden');
                completedHeading.style.display = 'none';
            }
        }

        function handleCheckboxChange(checkbox) {
            const listItem = checkbox.closest('li');
            if (checkbox.checked) {
                completedContainer.appendChild(listItem);
                listItem.classList.add('checked');
            } else {
                listContainer.appendChild(listItem);
                listItem.classList.remove('checked');
            }
            updateCompletedVisibility();
            saveToLocalStorage();
        }

        sectionContent.querySelector('.add-to-list-button').addEventListener('click', () => {
            const inputContainer = sectionContent.querySelector('.editable-container');
            const taskText = inputContainer.textContent.trim();
        
            if (taskText) {
                const listItem = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('change', function () {
                    handleCheckboxChange(this);
                });
        
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    listItem.remove();
                    updateCompletedVisibility();
                    savedata();
                });
        
                listItem.appendChild(checkbox);
                listItem.appendChild(document.createTextNode(taskText));
                listItem.appendChild(deleteButton);
        
                listContainer.appendChild(listItem);
        
                inputContainer.textContent = '';
                inputContainer.classList.remove('has-content');
                savedata();
            } else {
                alert('Please type something before adding to the list.');
            }
        });

        function savedata() {
            const sectionId = sectionContent.id.replace('-content', '');
            const listContainer = sectionContent.querySelector('#list-container');
            localStorage.setItem(`${sectionId}Tasks`, listContainer.innerHTML);
        }

        listContainer.addEventListener('click', (e) => {
            if (e.target.tagName.toUpperCase() === "LI") {
                e.target.classList.toggle("checked");
                savedata();
            } else if (e.target.tagName.toUpperCase() === "BUTTON") {
                e.target.parentElement.remove();
                savedata();
            }
        });

        function updateCompletedVisibility() {
            const completedItems = completedContainer.querySelectorAll('li');
            if (completedItems.length > 0) {
                completedContainer.classList.remove('hidden');
                completedHeading.style.display = 'block';
            } else {
                completedContainer.classList.add('hidden');
                completedHeading.style.display = 'none';
            }
        }

        sectionContent.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                handleCheckboxChange(this);
            });
        });

        updateCompletedVisibility();
    }

    ['life', 'work', 'goals', 'plans'].forEach(sectionId => {
        initializeSection(sectionId);
    });

    document.querySelectorAll('.editable-container').forEach(container => {
        const placeholder = container.getAttribute('data-placeholder');
        const placeholderElement = document.createElement('div');
        placeholderElement.textContent = placeholder;
        placeholderElement.classList.add('placeholder');
        container.appendChild(placeholderElement);
        container.addEventListener('input', () => {
            if (container.textContent.trim() !== '') {
                container.classList.add('has-content');
                placeholderElement.style.display = 'none';
            } else {
                container.classList.remove('has-content');
                placeholderElement.style.display = 'block';
            }
            saveToLocalStorage();
        });
    });

    // Load tasks from localStorage on page load
    ['life', 'work', 'goals', 'plans'].forEach(sectionId => {
        const savedTasksHTML = localStorage.getItem(`${sectionId}Tasks`) || '';
        const listContainer = document.getElementById(`${sectionId}-content`).querySelector('#list-container');
        listContainer.innerHTML = savedTasksHTML;
        
        // Reattach event listeners to loaded tasks
        listContainer.querySelectorAll('li').forEach(listItem => {
            const checkbox = listItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    handleCheckboxChange(this);
                });
            }

            const deleteButton = listItem.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    listItem.remove();
                    updateCompletedVisibility();
                    savedata();
                });
            }
        });
    });
});
