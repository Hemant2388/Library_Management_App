from flask_sqlalchemy import SQLAlchemy
from flask_security import RoleMixin, UserMixin
from sqlalchemy.orm import column_property
from datetime import datetime
db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key = True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255)) 
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                        backref = db.backref('users', lazy='dynamic'))

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String)


class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    content = db.Column(db.String, nullable=False)
    authors = db.Column(db.String(255), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    section = db.relationship('Section', backref=db.backref('books', lazy=True))

class BookRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    request_status = db.Column(db.String, default='NotRequested')
    status = db.Column(db.String)  # Status can be 'Pending', 'Approved', or 'Rejected'

    # Define relationships with User and Book models
    user = db.relationship('User', backref=db.backref('book_requests', lazy=True))
    book = db.relationship('Book', backref=db.backref('book_requests', lazy=True))
    section = db.relationship('Section', backref=db.backref('book_requests', lazy=True))

class BookTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_name = db.Column(db.Integer, db.ForeignKey('book.name'), nullable=False)
    section_name = db.Column(db.Integer, db.ForeignKey('section.name'), nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)  # Requested, Issued, Returned
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String, nullable=False)
    book_name = db.Column(db.String, nullable=False)
    feedback = db.Column(db.String, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
