"""Sheets app constants"""

REQUIRED_GOOGLE_API_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
# The index of the first row of a spreadsheet according to Google
GOOGLE_SHEET_FIRST_ROW = 1
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_AUTH_PROVIDER_X509_CERT_URL = "https://www.googleapis.com/oauth2/v1/certs"
ASSIGNMENT_MESSAGES_COMPLETED_KEY = "assignmentsCompleted"
ASSIGNMENT_MESSAGES_COMPLETED_DATE_KEY = "assignmentsCompletedDate"
ASSIGNMENT_SHEET_PREFIX = "Enrollment Codes"
ASSIGNMENT_SHEET_ENROLLED_STATUS = "enrolled"
GOOGLE_DATE_TIME_FORMAT = "DATE_TIME"
GOOGLE_SERVICE_ACCOUNT_EMAIL_DOMAIN = "iam.gserviceaccount.com"
GOOGLE_API_NOTIFICATION_TYPE = "webhook"
GOOGLE_API_FILE_WATCH_KIND = "api#channel"
GOOGLE_API_TRUE_VAL = "TRUE"
