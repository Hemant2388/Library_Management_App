export default {
    template: `<div>
    <div><h1>Welcome to Section: {{ this.$route.params.sectionName }} </h1></div><br>
    <div class="text-danger" v-if="error"><h3>{{ error }}</h3></div>
    <div class="row">
        <div v-for="(book, index) in allBooks" class="col-md-3 mb-4">
            <div class="card text-bg-dark" style="max-width: 18rem;">
            <div class="card-header">Author Name : {{ book.authors }}</div>
            <div class="card-body">
            <h5 class="card-title">Name: {{ book.name }} </h5>
            <router-link :to="{ path: '/content' + '/' + book.id }"><button class="btn btn-link">Click here to view content</button></router-link>      
            <br><br>
            <router-link  :to="{ path: '/update' + '/'+ $route.params.sectionName + '/' + $route.params.sectionID +  '/' +  book.id   }""><button class="btn btn-light">Update</button></router-link>
            <button class="btn btn-light" @click='delete_book(book.id)'>Delete</button>
            </div>
            </div>
        </div> 
    </div>
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Add Book
        </button>
        
        <!-- Modal -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <div class="text-danger" v-if="error1"><h5>{{ error1 }}</h5></div>
                <label for="book_name" class="form-label">Book Name</label>
                <input type="text" class="form-control" id="book_name"  v-model="book_name">
                <label for="author_name" class="form-label">Author Name</label>
                <input type="text" class="form-control" id="author_name"  v-model="author_name">
                <label for="content" class="form-label">Content</label>
                <textarea class="form-control" id="content"  v-model="content" placeholder="add link or content here"></textarea>
                <label for="section_name" class="form-label">Section Name</label>
                <input type="text" class="form-control" id="section_name" :value="this.$route.params && this.$route.params.sectionName" disabled>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click = "add_book(section_id)">Add Book</button>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>`,
    data() {
        return {
            allBooks : [],
            book_name: "",
            content: "",
            author_name: "",
            error : null,
            error1 : null,
            date_issued: null,
            return_date: null,
            token: localStorage.getItem('auth-token'),
            section_id: this.$route.params.sectionID
        }
    },
    
    mounted() {
        // Accessing route parameters in the mounted lifecycle hook
        const sectionId = this.$route.params.sectionID;
        console.log(sectionId);
      },
    methods: {
        async add_book(section_id) {
            const bookdata =  {
                book_name : this.book_name,
                author_name : this.author_name,
                content : this.content,
                date_issued : this.date_issued,
                return_date : this.return_date,
                section_id : this.section_id
            };
            const res = await fetch(`/add_book/${section_id}`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  "Authentication-Token": this.token
                },
                body: JSON.stringify(bookdata)
            });
            if (res.ok) {
                const data = await res.json()
                this.$router.go(0)
            }
            else{
                const data = await res.json()
                this.error1 = data.message
            }
        },
        async delete_book(book_id) {
            if(confirm("Are you sure you want to proceed with deleting the book? It will remove the requests made for the book by the student along with the feedbacks, and will also revoke the access from the student if the book request has been granted already")) {
                const res = await fetch(`/books/delete/${book_id}`, {
                    method: 'DELETE',
                    headers : {
                        'Content-Type': 'application/json',
                        "Authentication-Token": this.token
                    },
                });
                if (res.ok) {
                    this.$router.go(0)
                }
        }
        },
    },
    async mounted() {
        const res = await fetch(`/books/${this.section_id}`, {
            headers: {
                'Authentication-Token' : this.token,
            },                        
        });
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.allBooks = data
        }
        else {
            this.error = data.message
        }
    },
}