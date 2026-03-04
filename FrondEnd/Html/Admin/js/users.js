document.addEventListener('DOMContentLoaded', function() {
    loadUsers();

    // Search functionality
    document.getElementById('userSearch').addEventListener('input', function() {
        filterUsers(this.value);
    });

    // Add user button
    document.getElementById('btnAddUser').addEventListener('click', function() {
        openUserModal();
    });

    // Modal events
    document.getElementById('userModalCancel').addEventListener('click', closeUserModal);
    document.getElementById('userModalSave').addEventListener('click', saveUser);
});

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error loading users data. Please check the server.');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');

        const status = user.IsActive ? 'Active' : 'Inactive';
        const joinedDate = new Date(user.CreatedAt).toLocaleDateString();

        row.innerHTML = `
            <td>${user.FullName}</td>
            <td>${user.Email}</td>
            <td>${user.Role}</td>
            <td><span class="status-${status.toLowerCase()}">${status}</span></td>
            <td>${joinedDate}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editUser(${user.UserID})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.UserID})">Delete</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterUsers(query) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();
        const visible = name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
        row.style.display = visible ? '' : 'none';
    });
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');

    if (userId) {
        title.textContent = 'Edit User';
        // Load user data (placeholder)
        // For now, just open modal
    } else {
        title.textContent = 'Add User';
        form.reset();
    }

    modal.style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function saveUser() {
    // Placeholder for save functionality
    alert('Save functionality not implemented yet.');
    closeUserModal();
}

function editUser(userId) {
    openUserModal(userId);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        // Placeholder for delete functionality
        alert('Delete functionality not implemented yet.');
    }
}
