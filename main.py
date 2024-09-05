from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security 
from application.models import User, db, Section, Book, BookRequest
from application.resources import api
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_reminder, monthly_report


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.sqlite3'
    app.config['SECRET_KEY'] = "thisissecret"
    app.config['SECURITY_PASSWORD_SALT'] = "thisissalt"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    with app.app_context():
        api.init_app(app)
        db.init_app(app)
        excel.init_excel(app)
        app.security = Security(app, datastore)
        import application.views
    return app

app = create_app()
celery_app = celery_init_app(app)


@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    with app.app_context():
        users = User.query.all()
        for user in users:
            if user.roles[0].name == "Student":
                sender.add_periodic_task(
                    crontab(hour=10, minute=47), 
                    daily_reminder.s(user.email, "Daily Reminder"),
                )
    with app.app_context():
        users = User.query.all()
        for user in users:
            if user.roles[0].name == "Student":
                sender.add_periodic_task(
                    crontab(hour=10, minute=49), 
                    monthly_report.s(user.email, "Monthly Report", user.id)
                )
    


# @celery_app.on_after_configure.connect
# def send_email_to_users(sender, **kwargs):
#     users = User.query.all()
#     print(users)
#     for user in users:
#         sender.add_periodic_task(
#             crontab(hour=17, minute=6),
#             daily_reminder.s(user.email, "Visit our application"),
#         )

    
if __name__ == '__main__':
    app.run(debug=True)