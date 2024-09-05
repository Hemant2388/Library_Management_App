export default {
 
    template: ` 
                    <div class="container d-flex justify-content-center" style="margin-top: 20vh">
                        <div class="mb-5 p-5 bg-info text-white border">
                        <h1>Register</h1>
                            <div class="text-danger"><h5>{{ error }}</h5></div>
                            <label for="user-email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="email">
                            <label for="user-password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="user-password" v-model="password">
                            <button class="btn btn-primary mt-2" @click="registerUser"> Register </button>
                            <br><br>
                            <router-link to="/login">Login Here</router-link>
                        </div>
                    </div>
                `,
    data() {
        return {
            email : null,
            password : null,
            error : null
        }
    },
    methods: {
        async registerUser() {
          const userData = {
            email: this.email,
            password: this.password
          };
          const response = await fetch('/user-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
            if (response.ok) {
                const data = await response.json()
                this.$router.push("/login")
            }
            else{
                const data = await response.json()
                this.error = data.message
            }

        }
    }
}