from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required
from application.models import User, db, Section, Book, BookRequest, BookTransaction, Feedback
from application.sec import datastore
from flask_restful import marshal, fields 
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from sqlalchemy import or_, func
from application.tasks import revoke_access
from datetime import timedelta

@app.get('/')
def home():
    return render_template("index.html")

@app.get('/librarian')
@auth_required("token")
@roles_required("Librarian")
def admin():
    return "welcome admin"

@app.get('/activate/student/<int:student_id>')
@auth_required("token")
@roles_required("Librarian")
def activate_student(student_id):
    student = User.query.get(student_id)
    if not student:
        return jsonify({"message":"student not found"})
    student.active = True
    db.session.commit()
    return jsonify({"message":"User Activated"})

@app.get('/revoke/student/<int:student_id>')
@auth_required("token")
@roles_required("Librarian")
def revoke_student(student_id):
    student = User.query.get(student_id)
    if not student:
        return jsonify({"message":"student not found"})
    student.active = False
    db.session.commit()
    return jsonify({"message":"User Access Revoked"})    


@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message" : "*Email Not Provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message" : "*User Not Found"}), 404
    
    if user.active == True:
        if check_password_hash(user.password, data.get("password")):
            return jsonify({"token" : user.get_auth_token(), "email" : user.email, "role" : user.roles[0].name, "user_id" : user.id})
        else:
            return jsonify({"message" : "*Wrong Password"}), 400
    else:
        return jsonify({"message" : "*User access has been revoked, kindly contact the librarian"}), 403

@app.post('/user-registration')
def user_registration():
    email = request.json.get('email')
    password = request.json.get('password')

    if not email or not password:
        return jsonify({'message': '*Missing Required Fields'}), 400

    if datastore.find_user(email = email):
        return jsonify({'message' : '*User with this email already exists'}), 409
    
    datastore.create_user(email= email, password=generate_password_hash(password), roles=['Student'])

    db.session.commit()

    return jsonify({'message' : "*User Resgistered Successfully"}), 201


user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean
}

section_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "date_created": fields.String,
    "description": fields.String
}

book_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "content": fields.String,
    "authors": fields.String,
    "date_issued" : fields.DateTime,
    "return_date" : fields.DateTime,
    "section_id" : fields.Integer
}

request_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_id': fields.Integer,
    'request_date': fields.DateTime,
    'status': fields.String,
    'book': fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'content': fields.String,
        'authors': fields.String,
        "return_date" : fields.DateTime,
        "date_issued" : fields.DateTime
    }),
    'section' : fields.Nested({
        'id' : fields.Integer,
        'name': fields.String,
        "date_created" : fields.DateTime,
        "description" : fields.String
    }),
    'user' : fields.Nested({
       'email' : fields.String 
    })
}

profile_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_name': fields.String,
    'section_name': fields.String,
    'transaction_type': fields.String,
    "transaction_date" : fields.DateTime,
}

feedback_fields = {
    "id" : fields.Integer,
    "user_email" : fields.String,
    "book_name" : fields.String,
    "feedback" : fields.String,
    "rating" : fields.Integer,
}

@app.get("/users")
@auth_required("token")
@roles_required("Librarian")
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message" : "*User Not Found.."}), 404
    return marshal(users, user_fields)

@app.get("/feedbacks-ratings")
@auth_required("token")
def all_feedbacks():
    feedbacks = Feedback.query.all()
    if len(feedbacks) == 0:
        return jsonify({"message" : "*No feedbacks submitted yet.."}), 404
    return marshal(feedbacks, feedback_fields)

@app.get("/all-users-book-requests")
@auth_required("token")
@roles_required("Librarian")
def all_users_book_requests():
    student_requests = BookRequest.query.filter_by(status = "Requested").all()
    print("Number of pending requests:", len(student_requests))
    if len(student_requests) == 0:
        return jsonify({"message" : "*No requests recieved yet"}), 404
    return marshal(student_requests, request_fields)

@app.get("/all-users-book-requests/<user_id>")
@auth_required("token")
@roles_required("Student")
def users_book_requests(user_id):
    student_requests = BookRequest.query.filter_by(status = "Requested", user_id = user_id).all()
    print("Number of pending requests:", len(student_requests))
    if len(student_requests) == 0:
        return jsonify({"message" : "*No requests recieved yet"}), 404
    return marshal(student_requests, request_fields)


@app.get("/users-book-approved/<user_id>")
@auth_required("token")
@roles_required("Student")
def users_book_approved(user_id):
    student_requests = BookRequest.query.filter_by(status = "Approved", user_id = user_id).all()
    print("Number of pending requests:", len(student_requests))
    if len(student_requests) == 0:
        return jsonify({"message" : "*No Books Approved yet"}), 404
    return marshal(student_requests, request_fields)

@app.get("/all-users-book-issued")
@auth_required("token")
@roles_required("Librarian")
def all_users_book_issued():
    book_issued = BookRequest.query.filter_by(status = "Approved").all()
    if len(book_issued) == 0:
        return jsonify({"message" : "*No books issued yet"}), 404
    return marshal(book_issued, request_fields)

@app.route("/sections")
def all_sections():
    sections = Section.query.all()
    if len(sections) == 0:
        return jsonify({"message" : "*No Sections Added yet.."}), 404
    return marshal(sections, section_fields)

@app.route("/section/books/<section_id>")
def section_books_id(section_id):
    books = Book.query.filter(Book.section_id == section_id).all()
    if len(books) == 0:
        return jsonify({"message" : "*No Books added yet in this section.."}), 404
    return marshal(books, book_fields)    

@app.post("/add-sections")
@auth_required("token")
@roles_required("Librarian")
def add_section():
    name = request.json.get('section_name')
    description = request.json.get('section_description')

    if not description and not name :
        return jsonify({'message': '*Name and Description is must'}), 400
    
    if not name :
        return jsonify({'message': '*Name is must'}), 400
    
    if not description :
        return jsonify({'message': '*Description is must'}), 400


    exists = Section.query.filter_by(name=name).first()
    if exists:
        return jsonify({"message" : "*Section already exists"}), 400

    new_section = Section(name=name, description=description)

    db.session.add(new_section)
    db.session.commit()

    return jsonify({"message" : "*Section Added Successfully"}), 201

@app.delete("/delete-sections/<id>")
@auth_required("token")
@roles_required("Librarian")
def delete_section(id):
    section = Section.query.get(id)
    db.session.delete(section)
    db.session.commit()
    return jsonify({"message" : "*Section Deleted"}), 201

@app.put("/update-sections/<id>")
@auth_required("token")
@roles_required("Librarian")
def update_section(id):
    name = request.json.get('updated_section_name')
    description = request.json.get('updated_section_description')

    if not description and not name :
        return jsonify({'message': '*Name and Description is must'}), 400
    
    if not name :
        return jsonify({'message': '*Name is must'}), 400
    
    if not description :
        return jsonify({'message': '*Description is must'}), 400

    section_to_update = Section.query.get(id)

    if not section_to_update:
        return jsonify({"message" : "*Section Not Found"}), 404

    if name != section_to_update.name:
        exists = Section.query.filter(Section.name == name, Section.id != id).first()
        if exists:
            return jsonify({"message" : "*Section name already exists"}), 400

    section_to_update.name = name
    section_to_update.description = description

    db.session.commit()

    return jsonify({"message" : "*Section updated successfully.."}) 

@app.post("/feedback/<book_name>/<user_email>")
@auth_required("token")
@roles_required("Student")
def feedback(book_name, user_email):
    book_name = book_name
    user_email = user_email
    feedback_content = request.json.get("feedback")
    rating = request.json.get("rating")
    # print(book_name, user_email, feedback_content, rating)

    existing_feedback = Feedback.query.filter_by(book_name=book_name, user_email=user_email).first()
    
    if existing_feedback:
        return jsonify({"message": "You cannot post feedbacks for the same book twice"}), 404

    if not feedback_content:
        return jsonify({"message" : "*Feedback is required"}), 404

    if not rating:
        return jsonify({"message" : "*Rating is required"}), 404

    new_feedback = Feedback(book_name=book_name, user_email=user_email, feedback=feedback_content, rating=rating)
    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({"message": "Feedback posted successfully"}), 201


@app.post("/add_book/<section_id>")
@auth_required("token")
@roles_required("Librarian")
def add_book_to_section(section_id):
    name = request.json.get('book_name')
    author = request.json.get('author_name')
    content = request.json.get('content')
    section_id = section_id

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message" : "*Section not found"}), 404

    if not content and not name and not author:
        return jsonify({"message" : "*Name, Author and Content is must"}), 404
    if not name:
        return jsonify({"message" : "*Book name is must"}), 404
    if not author:
        return jsonify({"message" : "*Author name is must"}), 404
    if not content:
        return jsonify({"message" : "*Content name is must"}), 404

    new_book = Book(name = name, content = content, authors = author, section_id = section_id)

    db.session.add(new_book)
    db.session.commit()

    return jsonify({"message" : "Book Added Successfully"}), 201

@app.put("/update_book/<book_id>")
@auth_required("token")
@roles_required("Librarian")
def update_bookk(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    name = request.json.get('book_name')
    author = request.json.get('author')
    content = request.json.get('content')

    if not content and not name and not author:
        return jsonify({"message" : "*Name, Author, and Content are required"}), 400
    if not name:
        return jsonify({"message" : "*Book name is required"}), 400
    if not author:
        return jsonify({"message" : "*Author name is required"}), 400
    if not content:
        return jsonify({"message" : "*Content is required"}), 400

    book.name = name
    book.authors = author
    book.content = content

    db.session.commit()

    return jsonify({"message": "Book updated successfully"}), 200



@app.get("/books/<section_id>")
@auth_required("token")
@roles_required("Librarian")
def section_books(section_id):
    books = Book.query.filter(Book.section_id == section_id).all()
    if len(books) == 0:
        return jsonify({"message" : "*No books added in this section yet.."}), 404
    return marshal(books, book_fields)


# @app.delete("/books/delete/<book_id>")
# @auth_required("token")
# @roles_required("Librarian")
# def delete_book(book_id):
#     book = Book.query.get(book_id)
#     db.session.delete(book)
#     db.session.commit()
#     return jsonify({"message" : "*Section Deleted"}), 201

@app.delete("/books/delete/<book_id>")
@auth_required("token")
@roles_required("Librarian")
def delete_book(book_id):
    # Check if the book exists
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message" : "Book not found"}), 404

    # Delete associated book requests
    book_requests = BookRequest.query.filter_by(book_id=book_id).all()
    for request in book_requests:
        db.session.delete(request)

    #Delete associated feedbacks
    feedbacks = Feedback.query.filter_by(book_name = book.name)
    for feedback in feedbacks:
        db.session.delete(feedback)

    # Delete the book
    db.session.delete(book)
    db.session.commit()

    return jsonify({"message" : "Book and associated requests deleted"}), 200


@app.post("/request_book/<book_id>/<user_id>/<section_id>/<section_name>/<book_name>")
@auth_required("token")
@roles_required("Student")
def request_book_by_user(book_id, user_id, section_id, section_name, book_name):

    request = BookRequest.query.filter_by(book_id=book_id, user_id=user_id, section_id = section_id).first()
    total_requests_count = BookRequest.query.filter_by(user_id=user_id).filter(or_(BookRequest.status == "Requested", BookRequest.status == "Approved")).count()
    print(total_requests_count)

    if request and request.status == "Approved":
        return jsonify({"message" : "Book request has already been approved, Kindly check My Books"}), 400

    if request and request.status == "Requested":
        return jsonify({"message": "The request has already been made, Kindly wait for the Librarian to grant access"}), 400
    
    if total_requests_count >= 5:
        return jsonify({"message": "You have already made the total number of allowed requests. Kindly return books to make more new requests."}), 400
    
    if request and request.status == "Returned":
        request.status = "Requested"
        db.session.commit()
        return jsonify({"message": "Book request created successfully"})

    if request and request.status == "Revoked":
        request.status = "Requested"
        db.session.commit()
        return jsonify({"message": "Book request created successfully"})

    new_request = BookRequest(user_id=user_id, book_id=book_id, section_id = section_id, status="Requested")
    new_transaction = BookTransaction(user_id=user_id, book_name=book_name, section_name = section_name, transaction_type="Requested")
    db.session.add(new_request)
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"message": "Book request created successfully"}), 201


@app.route('/grant-book-access/<int:book_id>/<int:user_id>/<int:section_id>/<section_name>/<book_name>', methods=['GET', 'POST'])
@auth_required("token")
@roles_required("Librarian")  
def grant_book_access(book_id, user_id, section_id, section_name, book_name):
    user_book = BookRequest.query.filter_by(book_id = book_id, user_id = user_id).first()

    user_book.status = "Approved"

    new_transaction = BookTransaction(user_id=user_id, book_name=book_name, section_name = section_name, transaction_type="Approved")

    db.session.add(new_transaction)
    db.session.commit()

    revoke_access.apply_async(args=[book_id, user_id], eta=datetime.utcnow() + timedelta(days=7))

    return jsonify({"message" : "*Access Approved"}), 200

@app.route('/revoke-book-access/<int:book_id>/<int:user_id>/<section_name>/<book_name>', methods=['GET', 'POST'])
@auth_required("token")
@roles_required("Librarian")  
def revoke_book_access(book_id, user_id, section_name, book_name):
    user_book = BookRequest.query.filter_by(book_id = book_id, user_id = user_id).first()

    user_book.status = "Revoked"

    new_transaction = BookTransaction(user_id=user_id, book_name=book_name, section_name = section_name, transaction_type="Revoked")

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"message" : "*Access Revoked"}), 200    

@app.get("/user-books-approved/<user_id>")
@auth_required("token")
@roles_required("Student")
def user_books_approved(user_id):
    userbooks_approved = BookRequest.query.filter_by(user_id = user_id, status="Approved").all()
    if not userbooks_approved:
        return jsonify({"message" : "*No Books requested or approved yet, kindly wait"}), 404
    return marshal(userbooks_approved, request_fields), 200

@app.get("/user-profile-approved/<user_id>")
@auth_required("token")
@roles_required("Student")
def user_profile_approved(user_id):
    current_books  = BookTransaction.query.filter_by(user_id = user_id, transaction_type ="Approved").all()
    if not current_books:
        return jsonify({"message" : "*No books Read yet"}), 404
    return marshal(current_books, profile_fields), 200

@app.get("/user-profile-returned/<user_id>")
@auth_required("token")
@roles_required("Student")
def user_profile_returned(user_id):
    returned_books  = BookTransaction.query.filter_by(user_id = user_id, transaction_type ="Returned").all()
    if not returned_books:
        return jsonify({"message" : "*No books returned yet"}), 404
    return marshal(returned_books, profile_fields), 200

@app.get("/user-profile-revoked/<user_id>")
@auth_required("token")
@roles_required("Student")
def user_profile_revoked(user_id):
    revoked_books  = BookTransaction.query.filter_by(user_id = user_id, transaction_type ="Revoked").all()
    if not revoked_books:
        return jsonify({"message" : "*No books revoked by the librarian"}), 404
    return marshal(revoked_books, profile_fields), 200



@app.get("/return-book/<book_id>/<section_id>/<user_id>/<section_name>/<book_name>")
@auth_required("token")
@roles_required("Student")
def returnn_book(book_id, section_id, user_id, section_name, book_name):
    user_book = BookRequest.query.filter_by(book_id = book_id, user_id = user_id).first()

    user_book.status = "Returned"

    new_transaction = BookTransaction(user_id=user_id, book_name=book_name, section_name = section_name, transaction_type="Returned")

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"message" : "*Book Returned"}), 200   


@app.route("/search/book", methods=["POST"])
@auth_required("token")
def search_book():  
    search_term = request.json.get("searchTerm")

    # Check if the search term is provided
    if search_term == "":
        return jsonify({"error": "Search term is required"}), 404

    # Search for the book
    book = Book.query.filter(func.lower(Book.name) == func.lower(search_term)).first()

    if not book:
        return jsonify({"message": "Book doesn't exist"}), 404

    section_name = book.section.name

    return jsonify({"message": f"'{search_term}' exists under section '{section_name}'"}), 200

@app.route("/search/section", methods=["POST"])
@auth_required("token")
def search_section():  
    search_term = request.json.get("searchTerm")

    # Check if the search term is provided
    if search_term == "":
        return jsonify({"error": "Search term is required"}), 404

    # Search for the book
    book = Section.query.filter(func.lower(Section.name) == func.lower(search_term)).first()

    if not book:
        return jsonify({"message": "Section doesn't exist"}), 404

    return jsonify({"message": "Section exists in the Home Page"}), 200

@app.get("/content/<book_id>")
@auth_required("token")
def fetch_content(book_id):
    book = Book.query.filter(Book.id == book_id).first()
    return marshal(book, book_fields)