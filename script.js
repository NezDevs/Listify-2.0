document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu a, .private a, .others a');
    const cards = document.querySelectorAll('.cards .card');
    const dashboardContent = document.getElementById('dashboard-content');
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    let currentSection = localStorage.getItem('currentSection') || 'home';

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    function showSection(sectionId) {
        const sections = document.querySelectorAll('.main-content');
        sections.forEach(section => section.style.display = 'none');
        const section = document.getElementById(`${sectionId}-content`);
        if (section) {
            section.style.display = 'block';
        }
        currentSection = sectionId;
        localStorage.setItem('currentSection', currentSection);
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
            saveToLocalStorage(sectionId, 'lastEditedDate', currentDate);
        });
    });

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('closed');

        const mainContents = document.querySelectorAll('.main-content');
        mainContents.forEach(content => {
            content.style.marginLeft = sidebar.classList.contains('closed') ? '0' : '220px';
        });
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
            saveToLocalStorage(); // Ensure to save relevant data if needed
        });
    });

    function initializeSection(sectionId) {
        const sectionContent = document.getElementById(`${sectionId}-content`);
        const inputBox = sectionContent.querySelector('.editable-container');
        const listContainer = sectionContent.querySelector('#list-container');
        const completedContainer = sectionContent.querySelector('#completed-container');

        inputBox.addEventListener('input', () => {
            if (inputBox.textContent.trim() !== '') {
                inputBox.classList.add('has-content');
                placeholderElement.style.display = 'none';
            } else {
                inputBox.classList.remove('has-content');
                placeholderElement.style.display = 'block';
            }
        });

        function handleCheckboxChange(checkbox) {
            const listItem = checkbox.closest('li');
            if (checkbox.checked) {
                completedContainer.appendChild(listItem);
                listItem.classList.add('checked');
            } else {
                listContainer.appendChild(listItem);
                listItem.classList.remove('checked');
            }
            saveTasks(sectionId);
        }

        function addTask(taskText) {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', () => {
                handleCheckboxChange(checkbox);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                listItem.remove();
                saveTasks(sectionId);
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(document.createTextNode(taskText));
            listItem.appendChild(deleteButton);
            listContainer.appendChild(listItem);
        }

        function saveTasks(sectionId) {
            localStorage.setItem(`${sectionId}Tasks`, listContainer.innerHTML);
        }

        function showTasks() {
            listContainer.innerHTML = localStorage.getItem(`${sectionId}Tasks`) || '';
            listContainer.querySelectorAll('li').forEach(listItem => {
                const checkbox = listItem.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        handleCheckboxChange(checkbox);
                    });
                }

                const deleteButton = listItem.querySelector('.delete-button');
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        listItem.remove();
                        saveTasks(sectionId);
                    });
                }
            });
        }

        sectionContent.querySelector('.add-to-list-button').addEventListener('click', () => {
            const taskText = inputBox.textContent.trim();
            if (taskText !== '') {
                addTask(taskText);
                inputBox.textContent = '';
            }
            saveTasks(sectionId);
        });

        inputBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const taskText = inputBox.textContent.trim();
                if (taskText !== '') {
                    addTask(taskText);
                    inputBox.textContent = '';
                }
                saveTasks(sectionId);
            }
        });

        showTasks();
    }

    ['life', 'work', 'goals', 'plans'].forEach(sectionId => {
        initializeSection(sectionId);
    });

    function saveToLocalStorage(sectionId, key, value) {
        let storedData = JSON.parse(localStorage.getItem('taskData')) || {};
        if (!storedData[sectionId]) {
            storedData[sectionId] = {};
        }
        storedData[sectionId][key] = value;
        localStorage.setItem('taskData', JSON.stringify(storedData));
    }

    function loadFromLocalStorage(sectionId, key) {
        let storedData = JSON.parse(localStorage.getItem('taskData')) || {};
        return storedData[sectionId] ? storedData[sectionId][key] : null;
    }

    ['life', 'work', 'goals', 'plans'].forEach(sectionId => {
        const lastEditedDate = loadFromLocalStorage(sectionId, 'lastEditedDate');
        if (lastEditedDate) {
            const card = document.querySelector(`.cards .card[data-section="${sectionId}"]`);
            if (card) {
                card.querySelector('span').textContent = lastEditedDate;
            }
        }
    });

    // Show initial section based on localStorage or default
    showSection(currentSection);

    console.log('Page initialized successfully.');
});
