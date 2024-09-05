export default {
    template : `<div>
                    <h1 class="text-success">Welcome to User Profile</h1>
                    <p> User Email : {{ email }}</p>
                    <h3 class="text-primary"><u>Reading Activity</u></h3>
                    <div class="text-danger" v-if="error">{{ error }}</div>
                    <table class="table">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Section Name</th>
                        <th scope="col">Book Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(profile, index) in ApprovedBookHistory">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ profile.section_name }}</td>
                        <td>{{ profile.book_name }}</td>
                        </tr>
                    </tbody>
                    </table>
                    <h3 class="text-primary"><u>Books Returned History</u></h3>
                    <div class="text-danger" v-if="error2">{{ error2 }}</div>
                    <table class="table">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Section Name</th>
                        <th scope="col">Book Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(profile, index) in ReturnedBookHistory">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ profile.section_name }}</td>
                        <td>{{ profile.book_name }}</td>
                        </tr>
                    </tbody>
                    </table>
                    </table>
                    <h3 class="text-primary"><u>Revoked Books</u></h3>
                    <div class="text-danger" v-if="error3">{{ error3 }}</div>
                    <table class="table">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Section Name</th>
                        <th scope="col">Book Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(profile, index) in RevokedBookHistory">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ profile.section_name }}</td>
                        <td>{{ profile.book_name }}</td>
                        </tr>
                    </tbody>
                    </table>
                    </div>
                </div>`,
    data() {
        return {
            ApprovedBookHistory : [],
            ReturnedBookHistory : [],
            RevokedBookHistory : [],
            token: localStorage.getItem('auth-token'),
            email: localStorage.getItem('email'),
            user_id: localStorage.getItem('user_id'),
            error: null,
            error2: null,
            error3 : null
        }
    },
    async mounted() {
        // fetching approved books
        const res = await fetch(`/user-profile-approved/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.ApprovedBookHistory = data
        }
        else {
            this.error= data.message
        }

        // fetching returned books
        const res2 = await fetch(`/user-profile-returned/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data2 = await res2.json().catch((e) => { })
        if (res2.ok) {
            this.ReturnedBookHistory = data2
        }
        else {
            this.error2= data2.message
        }

        // fetching revoked books
        const res3 = await fetch(`/user-profile-revoked/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data3 = await res3.json().catch((e) => { })
        if (res3.ok) {
            this.RevokedBookHistory = data3
        }
        else {
            this.error3= data3.message
        }
    },
}