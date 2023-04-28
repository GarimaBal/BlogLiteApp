from celery import Celery
from flask import current_app as app1

celery = Celery("Application Jobs")

class ContextTask(celery.Task):
    def __call__(self,*args, **kwargs):
        with app1.app_context():
            return self.run(*args, **kwargs)