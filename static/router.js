import Home from "./components/Home.js"
import Login from "./components/Login.js"
import UserRegistration from "./components/UserRegistration.js"
import Users from "./components/Users.js"
import Book from "./components/Book.js"
import Book_requests from "./components/Book_requests.js"
import User_books from "./components/User_books.js"
import Book_issued from "./components/Book_issued.js"
import User_profile from "./components/User_profile.js"
import User_feedbacks_ratings from "./components/User_feedbacks_ratings.js"
import feedback_form from "./components/feedback_form.js"
import search from "./components/search.js"
import update_book from "./components/update_book.js"
import content from "./components/content.js"



const routes = [
    { path: '/', component: Home, name:"Home" },
    { path: '/login', component: Login, name: 'Login'},
    { path: '/registration', component: UserRegistration, name:"Registration"},
    { path: '/users', component: Users},
    { path: '/all-users-book-requests', component: Book_requests},
    { path: '/all-users-book-issued', component: Book_issued},
    { path: '/books/:sectionName/:sectionID', component: Book},
    { path: '/user-books/:userID', component: User_books },
    { path: '/user-profile/:userID', component: User_profile },
    { path: '/user-feedbacks-rating', component: User_feedbacks_ratings },
    { path: '/feedback_form/:book_name/:user_email', component: feedback_form },
    { path: '/search', component: search },
    { path: '/update/:section_name/:section_id/:book_id', component: update_book },
    { path: '/content/:book_id', component: content}

]

export default new VueRouter({
    routes,
})