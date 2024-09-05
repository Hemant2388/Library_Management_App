export default {
    
    template: ` 
                    
                    <div class="container d-flex justify-content-center" style="margin-top: 20vh">
                        <div class="mb-5 p-5 bg-info text-white border">
                        <div><h1> Login </h1></div>
                            <div class="text-danger"><h5>{{ error }}</h5></div>
                            <label for="user-email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
                            <label for="user-password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="user-password" v-model="cred.password">
                            <button class="btn btn-primary mt-2" @click="login"> Login </button>
                            <br><br>
                            <router-link to="/registration">Register Here</router-link>
                        </div>
                    </div>
                `,
    data() {
        return {
            cred: {
                email: null,
                password: null
            },
            error: null,
        }
    },
    methods: {
        async login() {
            const res = await fetch('/user-login', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify(this.cred),
            })
            const data = await res.json()
            if (res.ok) { 
                localStorage.setItem('auth-token', data.token)
                localStorage.setItem('role', data.role)
                localStorage.setItem('user_id', data.user_id)
                localStorage.setItem('email', data.email)
                this.$router.push({ path: '/' })
            }
            else{
                this.error = data.message
            }
        },
    },
                
}