export default {
    template:  `<div>
                <h2>Book Issued to Users</h2>
                <div class="text-danger" v-if="error"><h3>{{ error }}</h3></div>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">User Email</th>
                    <th scope="col">Section Name</th>
                    <th scope="col">Book Name</th>
                    <th scope="col">Revoke Book Access</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(request, index) in allIssued">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>{{ request.user.email }}</td>
                    <td>{{ request.section.name }}</td>
                    <td>{{ request.book.name }}</td>
                    <td><button @click="RevokeAccess(request.book_id, request.user_id, request.section.name, request.book.name)">Revoke</button></td>
                    </tr>
                </tbody>
                </table>
                </div>
    </div>`,
    data() {
        return{
            allIssued : [],
            token: localStorage.getItem('auth-token'),
            error: null,
        }
    },
    async mounted() {
        const res = await fetch('/all-users-book-issued', {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.allIssued = data
        }
        else {
            this.error= data.message
        }
    },
    methods: {
        async RevokeAccess(book_id, user_id, section_name, book_name) {
            const res = await fetch(`/revoke-book-access/${book_id}/${user_id}/${section_name}/${book_name}`, {
                headers : {
                    'Content-Type': 'application/json',
                    'method' : "POST",
                    'Authentication-Token' : this.token
                }
            });
            if (res.ok) {
                console.log("Access Revoked..")
                this.$router.go(0)
            }
        }
    }
}