from jinja2 import Template
from weasyprint import HTML


def format_report(template_file, data={}):
    with open(template_file) as file:
        template=Template(file.read())
        return template.render(data=data)

def create_pdf_report(data):
    message=format_report("reportformat.html", data=data)
    html=HTML(string=message)
    file_name="report.pdf"
    print(file_name)
    html.write_pdf(target=file_name)




        