export default {
    template : `<div>
    <h1 class="text-info">Welcome to MyBooks</h1>
    <br>
    <div class="text-danger" v-if="error">{{ error }}</div>
    <br>
    <div class="row">
    <div v-for="(books, index) in userBooks" :key="index" class="col-md-3 col-lg-3">
        <div class="card mb-4 shadow-sm">
        <!-- Card Header -->
        <div class="card-header">
            <h5 class="card-title">{{ books.book.name }}</h5>
        </div>
        <!-- Card Body -->
        <div class="card-body">
            <p class="card-text">Section Name: {{ books.section.name }}</p>
            <p class="card-text">Author Name: {{ books.book.authors }}</p>
            <router-link :to="{ path: '/content' + '/' + books.book.id }"><button class="btn btn-link">Click here to view content</button></router-link>      
            <br><br>
            <button @click="ReturnBook(books.book_id, books.section.id, books.user_id, books.section.name, books.book.name)">Return Book</button>
            <router-link  :to="{ path: '/feedback_form' + '/' + books.book.name + '/' + email }""><button>Give Feedback</button></router-link>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>
</div>`,
    data() {
        return {
            userBooks : [],
            feedbackData : [],
            book_name : "",
            user_email : "",
            feedback : "",
            rating : null,
            user_id : this.$route.params.userID,
            email : localStorage.getItem("email"),
            token: localStorage.getItem('auth-token'),
            error: null,
        }
    },
    async mounted() {
        const res = await fetch(`/user-books-approved/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.userBooks = data
            console.log(data)
        }
        else {
            this.error= data.message
        }
    },
    methods : {
        async ReturnBook(book_id,section_id, user_id, section_name, book_name) {
            const res = await fetch(`/return-book/${book_id}/${section_id}/${user_id}/${section_name}/${book_name}`, {
                headers : {
                    'Content-Type': 'application/json',
                    'method' : "POST",
                    'Authentication-Token' : this.token
                }
            });
            if (res.ok) {
                console.log("Book Returned..")
                this.$router.go(0)
            }
        }
    },
}