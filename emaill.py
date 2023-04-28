import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from email.mime.base import MIMEBase
from email import encoders


SMPTP_SERVER_HOST = "localhost"
SMPTP_SERVER_PORT = 1025
SENDER_ADDRESS = "email@garima.com"
SENDER_PASSWORD = ""

def send_email(to, sub, message, content="text", attachment_file=None):
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = to
    msg["Subject"] = sub
    if content=="html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))
    
    if attachment_file:
        with open(attachment_file, "rb") as attachment:
            part=MIMEBase("application","octet-stream")
            part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header(
            "content-Disposition", f"attachment; filename={attachment_file}"
        )
        msg.attach(part)

    s = smtplib.SMTP(host=SMPTP_SERVER_HOST, port=SMPTP_SERVER_PORT)
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True


def dformat_message(template_file, data={}):
    with open("dailyupdate.html") as file_:
            template = Template(file_.read())
            return template.render(data=data)

def dailyupdate(data):
        with open("dailyupdate.html") as file_:
            message=dformat_message("dailyupdate.html", data=data)
        send_email(data[2], sub = "Inactivity Update", message=message, content="html")

def mformat_message(template_file, data={}):
    with open("monthlyupdate.html") as file_:
            template = Template(file_.read())
            return template.render(data=data)

def monthlyupdate(data):
        with open("monthlyupdate.html") as file_:
            message=mformat_message("monthlyupdate.html", data=data)
        send_email("email@garima.com", sub = "Montly Engage Report", message=message, content="html", attachment_file="report.pdf")

