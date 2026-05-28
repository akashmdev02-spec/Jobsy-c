import smtplib
from email.mime.text import MIMEText

gmail_user = 'akash.mdev.0.2@gmail.com'
# Try different password formats (with spaces, without spaces, or check for typos)
passwords = [
    'spzsisqelekfwlse',
    'spzs isqe lekf wlse'
]

for gmail_password in passwords:
    print(f"Testing password: '{gmail_password}'...")
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(gmail_user, gmail_password)
        
        # Send a test email
        msg = MIMEText('This is a test verification email from smtplib.')
        msg['Subject'] = 'Test SMTP'
        msg['From'] = gmail_user
        msg['To'] = gmail_user
        
        server.sendmail(gmail_user, [gmail_user], msg.as_string())
        server.close()
        print("SUCCESS! Credentials work perfectly!")
        break
    except Exception as e:
        print(f"FAILED with error: {e}\n")
