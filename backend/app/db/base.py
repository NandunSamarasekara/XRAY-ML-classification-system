# Import all the models, so that Base has them before being imported by Alembic
from app.db.session import Base  # noqa
from app.models.doctor import Doctor  # noqa
from app.models.patient import PatientPortfolio  # noqa
from app.models.report import Report  # noqa
from app.models.comparison import Comparison  # noqa
from app.models.image import Image  # noqa
from app.models.review import Review  # noqa
