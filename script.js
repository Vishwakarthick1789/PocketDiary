document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('diary-form');
    const titleInput = document.getElementById('entry-title');
    const contentInput = document.getElementById('entry-content');
    const entriesList = document.getElementById('entries-list');
    const emptyState = document.getElementById('empty-state');
    const entriesCount = document.getElementById('entries-count');

    // Local Storage Key
    const STORAGE_KEY = 'pocket_diary_entries';

    // State
    let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Initialize UI
    renderEntries();

    // Event Listeners
    form.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
        e.preventDefault();

        // Get selected mood
        const moodRadio = document.querySelector('input[name="mood"]:checked');
        const mood = moodRadio ? moodRadio.value : '😊'; // Default fallback

        // Get values
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) return;

        // Create new entry
        const newEntry = {
            id: Date.now().toString(),
            title,
            content,
            mood,
            date: new Date().toISOString()
        };

        // Update state
        entries.unshift(newEntry);
        saveEntries();
        
        // Reset form
        form.reset();
        if (moodRadio) moodRadio.checked = false;
        
        // Render
        renderEntries();
    }

    function deleteEntry(id) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
        renderEntries();
    }

    function saveEntries() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function renderEntries() {
        // Update count
        entriesCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;

        if (entries.length === 0) {
            entriesList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        entriesList.innerHTML = '';

        entries.forEach((entry, index) => {
            const dateObj = new Date(entry.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'glass-card entry-card';
            // Stagger animation slightly for each item
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="entry-header">
                    <div class="entry-title-group">
                        <span class="entry-mood">${entry.mood}</span>
                        <div>
                            <h3 class="entry-title">${escapeHTML(entry.title)}</h3>
                            <span class="entry-date">${formattedDate}</span>
                        </div>
                    </div>
                    <button class="delete-btn" data-id="${entry.id}" title="Delete entry">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="entry-content">${escapeHTML(entry.content)}</div>
            `;

            entriesList.appendChild(card);
        });

        // Add event listeners to delete buttons dynamically
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // Simple animation before delete
                const card = e.currentTarget.closest('.entry-card');
                card.style.transform = 'scale(0.95)';
                card.style.opacity = '0';
                setTimeout(() => deleteEntry(id), 200);
            });
        });
    }

    // Utility to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
