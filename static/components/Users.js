export default {
    template: `<div>
    <div v-if="error">{{error}}</div>
    <div v-for="(user, index) in allUsers">
    {{user.email}}
    <br>
    <button class="btn btn-outline-success" v-if="!user.active" @click="approve(user.id)"> Approve Access </button>
    <button class="btn btn-outline-danger" v-if="user.active && user.email != 'librarian@gmail.com'" @click="revoke(user.id)"> Revoke Access </button></div>
    </div>`,
    data() {
        return {
            allUsers : [],
            token: localStorage.getItem('auth-token'),
            error: null,
        }
    },
    methods: {
        async approve(stdId) {
            const res = await fetch(`/activate/student/${stdId}`, {
                headers: {
                    "Authentication-Token": this.token,
                }
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)
            }
        },
        async revoke(stdId) {
            const res = await fetch(`/revoke/student/${stdId}`, {
                headers: {
                    "Authentication-Token": this.token
                }
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                this.$router.go(0)
            }
        },
    },
    async mounted() {
        const res = await fetch('/users', {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.allUsers = data
        }
        else {
            this.error= res.status
        }
    },
}