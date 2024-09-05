from celery import shared_task
from flask import render_template_string
from application.mail_service import send_message
from application.models import BookTransaction
from datetime import datetime, timedelta

@shared_task(ignore_result=True)
def daily_reminder(to, subject):
    try:
        html_content = render_template_string('''
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                <h1 style="font-size: 24px; color: #333; text-align: center;">Daily Reminder</h1>
                <p style="font-size: 16px; color: #666;">Hello there!</p>
                <p style="font-size: 16px; color: #666;">This is your daily reminder to visit our app.</p>
                <p style="font-size: 16px; color: #666;">If you have any questions or need assistance, feel free to contact us at <a href="mailto:21f1001345@ds.study.iitm.ac.in" style="color: #007bff; text-decoration: none;">21f1001345@ds.study.iitm.ac.in</a></p>
                <p style="font-size: 16px; color: #666; text-align: center;">Thank you!</p>
            </div>

        ''')
        send_message(to, subject, html_content)
        return "Mail Delivered.."
    except Exception as e:
        return f"Error: {e}"

@shared_task(ignore_result=True)
def monthly_report(to, subject, user_id):
    try:
        current_datetime = datetime.utcnow()
        if current_datetime.month == 1:  # If the current month is January
            start_date = datetime(current_datetime.year - 1, 12, 1)
        else:
            start_date = datetime(current_datetime.year, current_datetime.month - 1, 1)     
        
        end_date = datetime(current_datetime.year, current_datetime.month, 1) 
    
        transactions = BookTransaction.query.filter(
            BookTransaction.user_id == user_id,
            BookTransaction.transaction_date >= start_date,
            BookTransaction.transaction_date < end_date
        ).all()


        books_requested = []
        books_returned = []
        books_revoked = []

        for transaction in transactions:
            if transaction.transaction_type == "Requested":
                books_requested.append(transaction)
            elif transaction.transaction_type == "Returned":
                books_returned.append(transaction)
            elif transaction.transaction_type == "Revoked":
                books_revoked.append(transaction)

        requested_message = "No transactions" if not books_requested else None
        returned_message = "No transactions" if not books_returned else None
        revoked_message = "No transactions" if not books_revoked else None

        html_content = render_template_string('''
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }

                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }

                h1, h2 {
                    color: #333;
                }

                h2 {
                    margin-top: 20px;
                }

                ul {
                    list-style-type: none;
                    padding: 0;
                }

                li {
                    margin-bottom: 5px;
                }

                p {
                    margin-bottom: 10px;
                }

                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Monthly Report</h1>
                
                {% if requested_message %}
                <h3><u>Books that was requested by you last month:</u></h3>
                    <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                        <span style="font-weight: bold;">{{ requested_message }}</span>
                    </li>  
                {% else %}
                <h3><u>Books that was requested by you last month:</u></h3>
                <ul>
                    {% for book in books_requested %}
                        <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                                    <span style="font-weight: bold;">Book Name:</span> {{ book.book_name }}<br>
                                    <span style="font-weight: bold;">Section:</span> {{ book.section_name }}
                        </li>                    
                    {% endfor %}
                </ul>
                {% endif %}
                
                {% if returned_message %}
                <h3><u>Books that you returned back last month:</u></h3>
                        <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                                    <span style="font-weight: bold;">{{ returned_message }}</span> 
                        </li>                 
                {% else %}
                <h3><u>Books that you returned back last month:</u></h3>
                <ul>
                    {% for book in books_returned %}
                        <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                                    <span style="font-weight: bold;">Book Name:</span> {{ book.book_name }}<br>
                                    <span style="font-weight: bold;">Section:</span> {{ book.section_name }}
                        </li>                       
                    {% endfor %}
                </ul>
                {% endif %}

                {% if revoked_message %}
                <h3><u>Books whose access was revoked by the librarian last month:</u></h3>
                        <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                                    <span style="font-weight: bold;">{{ revoked_message }}</span> 
                        </li>                       
                {% else %}
                <h3><u>Books whose access was revoked by the librarian last month:</u></h3>
                <ul>
                    {% for book in books_revoked %}
                        <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                                    <span style="font-weight: bold;">Book Name:</span> {{ book.book_name }}<br>
                                    <span style="font-weight: bold;">Section:</span> {{ book.section_name }}
                        </li>                       
                    {% endfor %}
                </ul>
                {% endif %}
                
                <p>If you have any questions or concerns, feel free to contact us.</p>
            </div>
            <div class="footer">
                <p>Thank you!</p>
            </div>
        </body>
        ''', books_requested=books_requested, books_returned=books_returned, books_revoked=books_revoked, requested_message=requested_message, returned_message=returned_message, revoked_message=revoked_message)

        send_message(to, subject, html_content)
        return "Mail Delivered..."
    except Exception as e:
        return f"Error: {e}"

@shared_task(ignore_result=True)
def revoke_access(book_id, user_id):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    # Query for the user's book access that was granted seven days ago
    user_book = BookTransaction.query.filter_by(book_id=book_id, user_id=user_id, transaction_type="Approved") \
                                     .filter(BookTransaction.created_at <= seven_days_ago) \
                                     .first()
    if user_book:
        user_book.transaction_type = "Revoked"
        db.session.commit()