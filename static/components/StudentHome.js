export default {
    template: `<div>
    <div class="d-flex justify-content-between align-items-center">
    <h3 class="text-success m-0">Welcome {{ email }}</h3>
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center">
            <span class="fw-bold text-danger me-2">Important Instructions:</span>
            <!-- Button trigger modal -->
            <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Please Read!!
            </button>

            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Important Instructions</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul>
                        <li class="text-danger">User cannot request more than 5 books</li>
                        <li class="text-danger">User must return books within 7 days from the date of approval, or the librarian will revoke the access manually after seven days</li>
                        <li class="text-danger">Librarian can revoke the portal access from user if found doing any malpractises and the user must contact librarian for access </li>
                        <li class="text-danger">User can go to search in the navigation bar and search for books and section and see if its available or not</li>
                        <li class="text-danger">User can give feedbacks and rate books, and can also see others feedbacks and top rated books</li>
                        <li class="text-danger">User will get daily reminders at 7pm IST asking them to visit the application</li>
                        <li class="text-danger">User will get a montly report at the first day of every month which will contain informations of the user activity of the previous month </li>
                        <li class="text-primary"> FOR ANY OTHER ENQUIRY CONTACT US AT : 21F1001345@DS.STUDY.IITM.AC.IN</li>
                    </ul>
                    <h3 class="text-success">Enjoy Reading !!!!!!</h3>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</div>

    <div>
        PENDING REQUESTS:
        <span v-for="(request, index) in requestsmade" :key="index" class="text-primary">
            {{ request.book.name }}
            <template v-if="index !== requestsmade.length - 1">, </template>
        </span>
    </div>
    <div>
        BOOKS APPROVED:
        <span v-for="(request, index) in requestsapproved" :key="index" class="text-primary">
            {{ request.book.name }}
            <template v-if="index !== requestsapproved.length - 1">, </template>
        </span>
    </div>
    <br>
    <div class="text-danger" v-if="errorr">{{ errorr }}</div>
    <div class="row">
      <div v-for="(section, index) in allSections" :key="index" class="col-md-3 col-lg-3">
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">{{ section.name }}</h5>
            <p class="card-text">{{ section.description }}</p>
            <div class="text-danger" v-if="error3 && error3[section.id]">{{ error3[section.id] }}</div>
          </div>
          <ul class="list-group list-group-flush">
            <li v-for="(book, bookIndex) in sectionBooks[index]" :key="bookIndex" class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ book.name }}</strong>
                <p><em>Author: {{ book.authors }}</em></p>
                <p v-if="error2 && error2[book.id]" class="text-danger">{{ error2[book.id] }}</p>
              </div>
              <button class="btn btn-outline-success" @click="requestBook(book.id, user_id, section.id, book.name, section.name)">Request Book</button>
            </li>
          </ul>
          <div class="card-body"></div>
        </div>
      </div>
    </div>
  </div>`,
    data () {
        return {
            bookRequests : [],
            allSections : [],
            sectionBooks : [],
            requestsmade: [],
            requestsapproved: [],
            token: localStorage.getItem('auth-token'),
            role: localStorage.getItem('role'),
            email: localStorage.getItem('email'),
            user_id: localStorage.getItem('user_id'),
            error: null,
            errorr: null,
            error3: {},
            error2 : {}
        }
    },
    async mounted() {
        const res = await fetch('/sections', {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json()
        if (res.ok) {
            this.allSections = data
        }
        else {
            this.errorr= data.message 
        }
        for (const section of this.allSections) {
            this.$set(this.error3, section.id, null);
            const sectionBooksRes = await fetch(`/section/books/${section.id}`, {
                headers: {
                    'Authentication-Token': this.token,
                },
            });
            const sectionBooksData = await sectionBooksRes.json();
            if (sectionBooksRes.ok) {
                this.sectionBooks.push(sectionBooksData);
            } else {
                this.error3[section.id] = sectionBooksData.message;
            }
        }
        const res2 = await fetch(`/all-users-book-requests/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data2 = await res2.json().catch((e) => { })
        if (res2.ok) {
            this.requestsmade = data2
        }
        const res3 = await fetch(`/users-book-approved/${this.user_id}`, {
            method: "GET",
            headers: {
                'Authentication-Token': this.token,
            }
        });
        const data3 = await res3.json().catch((e) => { })
        if (res3.ok) {
            this.requestsapproved = data3
        }
    },
    methods : {
        async requestBook(book_id, user_id, section_id, section_name, book_name) {
            this.$set(this.error2, book_id, null);
            const res = await fetch(`/request_book/${book_id}/${user_id}/${section_id}/${book_name}/${section_name}`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authentication-Token": this.token
                  },
            });
            if (res.ok) {
                const data = await res.json()
                this.error2[book_id] = data.message;
                this.$router.go(0)                
            }
            else {
                const data = await res.json()
                this.error = data.message
                this.error2[book_id] = data.message;
            }
           
        }
    }
}