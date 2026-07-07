from flask_bcrypt import Bcrypt
from flask_login import LoginManager

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message = 'Bitte melde dich an, um fortzufahren.'
login_manager.login_message_category = 'info'

bcrypt = Bcrypt()
