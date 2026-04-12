const usersState = {
    users: [],
    search: '',
    editingUser: null
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm')?.addEventListener('submit', handleUpdateUser);
    document.getElementById('cancelUserEditBtn')?.addEventListener('click', clearEditUser);
    document.getElementById('refreshUsersBtn')?.addEventListener('click', loadUserList);
    document.getElementById('seedUsersDemoBtn')?.addEventListener('click', handleSampleUsers);
    document.getElementById('deleteAllUsersBtn')?.addEventListener('click', handleDeleteAll);
    document.getElementById('searchClearBtn')?.addEventListener('click', clearSearch);
    document.getElementById('userSearchInput')?.addEventListener('input', MovieRecUI.debounce(handleSearch, 150));

    loadUserList();
});

async function loadUserList() {
    const listEl = document.getElementById('userList');
    if (!listEl) return;

    listEl.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><span>Loading users...</span></div>';

    try {
        const users = await getUsers();
        usersState.users = Array.isArray(users) ? users : [];
        renderUsers();
        MovieRecUI.refreshConnectionStatus();
        if (typeof window.loadAdminSummary === 'function') {
            window.loadAdminSummary();
        }
    } catch (error) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">X</div>
                <h3>Unable to load users</h3>
                <p>${MovieRecUI.esc(error.message)}</p>
            </div>`;
        showToast(error.message, 'error');
    }
}

function renderUsers() {
    const query = usersState.search.trim().toLowerCase();
    const filtered = usersState.users.filter((user) =>
        !query || `${user.name} ${user.age || ''} ${user.role || 'user'}`.toLowerCase().includes(query)
    );

    const userCount = document.getElementById('userCount');
    const activeUsers = document.getElementById('activeUsers');
    const userCountBadge = document.getElementById('userCountBadge');

    if (userCount) userCount.textContent = usersState.users.length;
    if (activeUsers) {
        activeUsers.textContent = usersState.users.filter((user) =>
            (user.watchedCount || 0) + (user.likedCount || 0) > 0
        ).length;
    }
    if (userCountBadge) userCountBadge.textContent = `${filtered.length} users`;

    const listEl = document.getElementById('userList');
    if (!listEl) return;

    if (!filtered.length) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">U</div>
                <h3>${usersState.users.length ? 'No matching users' : 'No users yet'}</h3>
                <p>${usersState.users.length ? 'Try a different search keyword.' : 'Create a user or seed sample users first.'}</p>
            </div>`;
        return;
    }

    listEl.innerHTML = filtered.map((user) => `
        <div class="list-item">
            <div class="list-item-info">
                <div class="list-item-icon">U</div>
                <div>
                    <strong>${MovieRecUI.esc(user.name)}</strong>
                    ${user.age ? `<span style="color:var(--text-muted)"> (${user.age} yrs)</span>` : ''}
                    <div class="rel-tags">
                        <span class="badge ${user.role === 'admin' ? 'badge-warning' : 'badge-primary'}">${user.role === 'admin' ? 'Admin' : 'User'}</span>
                        ${(user.watchedCount || 0) > 0 ? `<span class="badge badge-primary">Watched ${user.watchedCount}</span>` : ''}
                        ${(user.likedCount || 0) > 0 ? `<span class="badge badge-success">Liked ${user.likedCount}</span>` : ''}
                        ${(user.watchedCount || 0) + (user.likedCount || 0) === 0 ? '<span class="badge badge-danger">No activity</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="list-item-actions">
                ${typeof window.loadAdminUserProfile === 'function' ? `<button class="btn btn-outline btn-sm" onclick="loadAdminUserProfile('${MovieRecUI.escJs(user.name)}')">View taste</button>` : ''}
                <button class="btn btn-outline btn-sm" onclick="beginEditUser('${MovieRecUI.escJs(user.name)}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="handleDeleteUser('${MovieRecUI.escJs(user.name)}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddUser(event) {
    event.preventDefault();

    const name = document.getElementById('userName')?.value.trim();
    const ageValue = document.getElementById('userAge')?.value;
    const age = ageValue ? Number(ageValue) : null;
    const role = document.getElementById('userRole')?.value || 'user';
    const password = document.getElementById('userPassword')?.value.trim() || null;
    const btn = document.getElementById('addUserBtn');

    if (!name) {
        showToast('Please provide a user name', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Saving...';
    }

    try {
        await createUser(name, age, { role, password });
        showToast(`Saved user "${name}"`, 'success');
        event.target.reset();

        const roleField = document.getElementById('userRole');
        if (roleField) roleField.value = 'user';

        await loadUserList();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Add User';
        }
    }
}

function beginEditUser(name) {
    const user = usersState.users.find((item) => item.name === name);
    if (!user) return;

    usersState.editingUser = user;
    document.getElementById('editUserOriginalName').value = user.name;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserAge').value = user.age || '';

    const roleField = document.getElementById('editUserRole');
    if (roleField) roleField.value = user.role || 'user';

    const passwordField = document.getElementById('editUserPassword');
    if (passwordField) passwordField.value = '';

    if (typeof window.loadAdminUserProfile === 'function') {
        window.loadAdminUserProfile(user.name);
    }

    document.getElementById('editUserName').focus();
}

function clearEditUser() {
    usersState.editingUser = null;
    document.getElementById('editUserForm')?.reset();

    const original = document.getElementById('editUserOriginalName');
    if (original) original.value = '';

    const roleField = document.getElementById('editUserRole');
    if (roleField) roleField.value = 'user';
}

async function handleUpdateUser(event) {
    event.preventDefault();

    if (!usersState.editingUser) {
        showToast('Select a user first', 'warning');
        return;
    }

    const payload = {
        name: document.getElementById('editUserName').value.trim(),
        age: document.getElementById('editUserAge').value ? Number(document.getElementById('editUserAge').value) : null,
        role: document.getElementById('editUserRole')?.value || usersState.editingUser.role || 'user',
        password: document.getElementById('editUserPassword')?.value.trim() || null
    };

    if (!payload.name) {
        showToast('User name is required', 'error');
        return;
    }

    const btn = document.getElementById('saveUserEditBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Saving...';
    }

    try {
        await updateUserAPI(usersState.editingUser.name, payload);

        const currentUser = MovieRecUI.getCurrentUser();
        if (currentUser?.name === usersState.editingUser.name) {
            MovieRecUI.saveCurrentUser({
                ...currentUser,
                name: payload.name,
                age: payload.age,
                role: payload.role || currentUser.role
            });
        }

        showToast(`Updated user "${payload.name}"`, 'success');
        clearEditUser();
        await loadUserList();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Save changes';
        }
    }
}

async function handleDeleteUser(name) {
    if (!confirm(`Delete "${name}" and all of that user's relationships?`)) return;

    try {
        await deleteUserAPI(name);
        showToast(`Deleted "${name}"`, 'success');
        if (usersState.editingUser?.name === name) clearEditUser();
        await loadUserList();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleDeleteAll() {
    if (!confirm('Delete all users?')) return;
    if (!confirm('Confirm again: this will remove every user node.')) return;

    try {
        await deleteAllUsersAPI();
        clearEditUser();
        showToast('Deleted all users', 'success');
        await loadUserList();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleSampleUsers() {
    try {
        await addSampleUsersAPI();
        showToast('Sample users added', 'success');
        await loadUserList();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function handleSearch(event) {
    usersState.search = event.target.value || '';
    renderUsers();
}

function clearSearch() {
    usersState.search = '';
    const input = document.getElementById('userSearchInput');
    if (input) input.value = '';
    renderUsers();
}

window.beginEditUser = beginEditUser;
window.handleDeleteUser = handleDeleteUser;
window.loadUserList = loadUserList;
