export default {
    template : `<div>
                        <div class="container mt-5">
                        <div class="row">
                            <div class="col-md-8 offset-md-2">
                                <h2 class="text-center mb-4">Book Content</h2>
                                <div class="content">
                                    <p>{{ book.content }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`,
    data() {
        return{
            book_id : this.$route.params.book_id,
            token: localStorage.getItem('auth-token'),
            book : []
        }
    },
    async mounted() {
        this.book_id = this.$route.params.book_id;
        const res = await fetch(`/content/${this.book_id}`, {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.book = data
        }
        else {
            this.error= res.status
        }
    },
}
