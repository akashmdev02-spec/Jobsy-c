import os
import smtplib
from email.mime.text import MIMEText

gmail_user = os.environ.get('SPRING_MAIL_USERNAME', 'placeholder@gmail.com')
gmail_password = os.environ.get('SPRING_MAIL_PASSWORD', 'placeholder_password')

print(f"Testing SMTP credentials for '{gmail_user}'...")
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(gmail_user, gmail_password)
    
    msg = MIMEText('This is a test verification email.')
    msg['Subject'] = 'Test SMTP'
    msg['From'] = gmail_user
    msg['To'] = gmail_user
    
    server.sendmail(gmail_user, [gmail_user], msg.as_string())
    server.close()
    print("SUCCESS! Credentials work perfectly!")
except Exception as e:
    print(f"FAILED with error: {e}\n")
