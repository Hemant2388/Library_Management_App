from main import app
from application.models import db, Role
from werkzeug.security import generate_password_hash
from application.sec import datastore


with app.app_context():
    db.create_all()
    # librarian = Role(id="librarian", name="Librarian", description="Librarian Description")
    # db.session.add(librarian)
    # admin = Role(id="admin", name="Admin", description="Admin Description")
    # db.session.add(admin)
    # student = Role(id="student", name="Student", description="Student Description")
    # db.session.add(student)
    # try:
    #     db.session.commit()
    # except:
    #     pass
    datastore.find_or_create_role(name="Librarian", description="User is the Librarian")
    datastore.find_or_create_role(name="Student", description="User is a Student")
    db.session.commit()
    if not datastore.find_user(email="librarian@gmail.com"):
        datastore.create_user(email="librarian@gmail.com", password=generate_password_hash("librarian"), roles=['Librarian'])
    if not datastore.find_user(email="student1@gmail.com"):
        datastore.create_user(email="student1@gmail.com", password=generate_password_hash("student1"), roles=['Student'])
    if not datastore.find_user(email="student2@gmail.com"):
        datastore.create_user(email="student2@gmail.com", password=generate_password_hash("student2"),active=False, roles=['Student'])
    db.session.commit()

