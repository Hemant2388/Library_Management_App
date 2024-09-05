export default {
    template: `<div>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                    <a class="navbar-brand" href="#">Library Management Application</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav">
                        <li class="nav-item">
                            <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
                        </li>
                        <li class="nav-item" v-if="role=='Librarian'">
                            <router-link class="nav-link" to="/users">Users</router-link>
                        </li>
                        <li class="nav-item" v-if="role=='Student'">
                            <router-link class="nav-link" :to="'/user-profile/' + user_id">My Reading History</router-link>
                        </li>
                        <li class="nav-item" v-if="role=='Student'">
                            <router-link class="nav-link" :to="'/user-books/' + user_id">My Books</router-link>
                        </li>
                        <li class="nav-item" v-if="role=='Librarian'">
                            <router-link class="nav-link" to="/all-users-book-requests">Book Requests</router-link>
                        </li>
                        <li class="nav-item" v-if="role=='Librarian'">
                            <router-link class="nav-link" to="/all-users-book-issued">Book Issued</router-link>
                        </li>
                        <li class="nav-item" v-if="role === 'Librarian' || role === 'Student'">
                            <router-link class="nav-link" to="/user-feedbacks-rating">Feedbacks and Ratings</router-link>
                        </li>
                        <li class="nav-item" v-if="role === 'Librarian' || role === 'Student'">
                            <router-link class="nav-link" to="/search">Search</router-link>
                        </li>
                        <li class="nav-item text-end" v-if='is_login'>
                            <button class="nav-link" @click='logout'>Logout</button>
                        </li>
                        </ul>
                    </div>
                    </div>
                </nav>
               </div>`,
               data() {
                return {
                    user_id : localStorage.getItem('user_id'),
                    role: localStorage.getItem('role'),
                    is_login: localStorage.getItem('auth-token')
                }
               },
               methods: {
                logout() {
                    localStorage.removeItem('auth-token')
                    localStorage.removeItem('role')
                    localStorage.removeItem('user_id')
                    this.$router.push('/login')
                },
               }
}