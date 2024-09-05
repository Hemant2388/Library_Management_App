export default {
    template : `<div>
                    <div class="container mt-5">
                    <h2 class="mb-4">Update Book</h2>
                    <h3 class="text-danger" v-if="error"> {{ error }}</h3>
                    <form id="updateForm">
                        <div class="form-group">
                            <label for="bookName">Book Name</label>
                            <input type="text" class="form-control" id="bookName" v-model="book_name" placeholder="Enter book name">
                        </div>
                        <div class="form-group">
                            <label for="content">Content</label>
                            <textarea class="form-control" id="content" rows="5" v-model="content" placeholder="Enter book content/Link"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="author">Author</label>
                            <input type="text" class="form-control" id="author" v-model="author" placeholder="Enter author name">
                        </div>
                        <br>
                        <button type="submit" @click="updateBook($route.params.book_id)" class="btn btn-primary">Update</button>
                    </form>
                </div>
                </div>`,
    data() {
        return {
            book_name : '',
            author : '',
            content : '',
            error: null,
            token: localStorage.getItem('auth-token'),
            section_name : this.$route.params.section_name,
            section_id : this.$route.params.section_id
        }
    },
    methods : {
        async updateBook(book_id) {
            const updatedBookData = {
                book_name: this.book_name,
                author: this.author,
                content : this.content
              };
              const res = await fetch(`/update_book/${book_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  "Authentication-Token": this.token
                },
                body: JSON.stringify(updatedBookData)
            });
            if (res.ok) {
                const data = await res.json()
                this.$router.push({path : `/books/${this.section_name}/${this.section_id}`})
            }
            else{
                const data = await res.json()
                this.error = data.message
            }
        },
    }
}