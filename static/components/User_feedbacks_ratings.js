export default {
    template : `<div>
                    <div>
                    <div class="container">
                        <h1 class="mt-4">Top Rated Feedbacks</h1>
                        <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">User Email</th>
                                <th scope="col">Book Name</th>
                                <th scope="col">Feedback</th>
                                <th scope="col">Rating</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="(feedback, index) in topRatedFeedbacks" :key="index">
                                <th scope="row">{{ index + 1 }}</th>
                                <td>{{ feedback.user_email }}</td>
                                <td>{{ feedback.book_name }}</td>
                                <td>{{ feedback.feedback }}</td>
                                <td>{{ feedback.rating }}</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                    <div class="container">
                        <h1 class="mt-4">Other Feedbacks</h1>
                        <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">User Email</th>
                                <th scope="col">Book Name</th>
                                <th scope="col">Feedback</th>
                                <th scope="col">Rating</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="(feedback, index) in otherFeedbacks" :key="index">
                                <th scope="row">{{ index + 1 }}</th>
                                <td>{{ feedback.user_email }}</td>
                                <td>{{ feedback.book_name }}</td>
                                <td>{{ feedback.feedback }}</td>
                                <td>{{ feedback.rating }}</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>
                </div>`,
                
    data() {
        return {
            allFeedbacks : [],
            token: localStorage.getItem('auth-token'),
            error: null,
        }
    },
    computed: {
        topRatedFeedbacks() {
          return this.allFeedbacks.filter((feedback) => feedback.rating === 5);
        },
        otherFeedbacks() {
          return this.allFeedbacks.filter((feedback) => feedback.rating < 5);
        },
      },
    async mounted() {
        const res = await fetch('/feedbacks-ratings', {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json().catch((e) => { })
        if (res.ok) {
            this.allFeedbacks = data
        }
        else {
            this.error= res.status
        }
    },
    
}