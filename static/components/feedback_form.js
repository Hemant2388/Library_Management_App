export default {
    template : `<div>
                    <div class="container mt-3">
                    <div class="row justify-content-center">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="mb-0">Feedback Form</h5>
                                </div>
                                <div class="card-body">
                                    <form>
                                        <h3 v-if="error" class="text-danger">{{ error }}</h3>
                                        <div class="mb-3">
                                            <label for="book_name" class="form-label">Book Name</label>
                                            <input type="text" class="form-control" id="book_name" :value="book_name" disabled>
                                        </div>
                                        <div class="mb-3">
                                            <label for="user_email" class="form-label">Your Email</label>
                                            <input type="email" class="form-control" id="user_email" :value="user_email"  disabled>
                                        </div>
                                        <div class="mb-3">
                                            <label for="feedback" class="form-label">Feedback</label>
                                            <textarea class="form-control" id="feedback" v-model="feedback" rows="2"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="rating" class="form-label">Rating</label>
                                            <select class="form-select" id="rating" v-model="rating">
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <button type="submit" class="btn btn-primary" @click="add_feedback(book_name, user_email)">Submit Feedback</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>`,
    data() {
        return{
            feedbackData : [],
            book_name : this.$route.params.book_name,
            user_email : this.$route.params.user_email,
            feedback : "",
            rating : null,
            token: localStorage.getItem('auth-token'),
            error: null
        }
    },
    methods : {
        async add_feedback(book_name, user_email) {
            const feedbackData =  {
                book_name : this.book_name,
                user_email : this.user_email,
                feedback : this.feedback,
                rating : this.rating
            };
            const res = await fetch(`/feedback/${book_name}/${user_email}`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  "Authentication-Token": this.token
                },
                body: JSON.stringify(feedbackData)
            });
            if (res.ok) {
                const data = await res.json()
                this.$router.push({ path: '/user-feedbacks-rating' })
            }
            else{
                const data = await res.json()
                this.error = data.message
            }
        },
    }
}