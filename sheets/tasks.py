"""Sheets app tasks"""
from googleapiclient.errors import HttpError

from mitxpro.celery import app
from mitxpro.utils import now_in_utc
from sheets import api
from sheets.constants import ASSIGNMENT_SHEET_ENROLLED_STATUS


@app.task
def handle_unprocessed_coupon_requests():
    """
    Goes through all unprocessed rows in the coupon request sheet, creates the requested
    coupons, updates the request sheet to indicate that it was processed, and creates
    the necessary coupon assignment sheets.
    """
    coupon_request_handler = api.CouponRequestHandler()
    results = coupon_request_handler.process_sheet()
    return results


@app.task
def handle_incomplete_coupon_assignments():
    """
    Processes all as-yet-incomplete coupon assignment spreadsheets
    """
    coupon_assignment_handler = api.CouponAssignmentHandler()
    processed_spreadsheet_metadata = (
        coupon_assignment_handler.process_assignment_spreadsheets()
    )
    return processed_spreadsheet_metadata


@app.task
def update_incomplete_assignment_delivery_statuses():
    """
    Fetches all BulkCouponAssignments that have assignments but have not yet finished delivery, then updates the
    delivery status for each depending on what has been sent.
    """
    coupon_assignment_handler = api.CouponAssignmentHandler()
    updated_assignments = (
        coupon_assignment_handler.update_incomplete_assignment_message_statuses()
    )
    return [
        (bulk_assignment_id, len(product_coupon_assignments))
        for bulk_assignment_id, product_coupon_assignments in updated_assignments.items()
    ]


@app.task
def set_assignment_rows_to_enrolled(sheet_update_map):
    """
    Sets the status to "enrolled" (along with status date) for the specified rows
    in a coupon assignment sheet.

    Args:
        sheet_update_map (dict): A dict with assignment sheet id's mapped to pairs of coupon codes
            and emails representing the rows that need to be set to enrolled.
            Example: {"sheet-id-1": [["couponcode1", "a@b.com"], ["couponcode2", "c@d.com"]]}

    Returns:
        dict: A summary of execution results. The id of each provided sheet is mapped to the
            number of updated assignments in that sheet.
    """
    now = now_in_utc()
    coupon_assignment_handler = api.CouponAssignmentHandler()
    result_summary = {}
    for sheet_id, assignment_code_email_pairs in sheet_update_map.items():
        # Convert the list of lists into a set of tuples, and set the strings to lowercase so
        # the matches will be case-insensitive.
        assignment_code_email_set = set(
            (
                assignment_code_email_pair[0].lower(),
                assignment_code_email_pair[1].lower(),
            )
            for assignment_code_email_pair in assignment_code_email_pairs
        )
        _, worksheet = coupon_assignment_handler.fetch_assignment_sheet(sheet_id)
        assignment_rows = coupon_assignment_handler.get_sheet_rows(worksheet)
        status_row_updates = []
        for assignment_row in assignment_rows:
            if not assignment_row.code or not assignment_row.email:
                continue
            if (
                assignment_row.code.lower(),
                assignment_row.email.lower(),
            ) in assignment_code_email_set:
                status_row_updates.append(
                    (assignment_row.row_index, ASSIGNMENT_SHEET_ENROLLED_STATUS, now)
                )
        coupon_assignment_handler.update_sheet_with_new_statuses(
            sheet_id, status_row_updates
        )
        result_summary[sheet_id] = len(assignment_code_email_pairs)
    return result_summary


@app.task(autoretry_for=(HttpError,), retry_kwargs={"max_retries": 3, "countdown": 5})
def renew_file_watches():
    """
    Renews push notifications for changes to certain files via the Google API.
    """
    # This task is run on a schedule and ensures that there is an unexpired file watch
    # on the coupon request sheet. If a file watch was manually created/updated at any
    # point, this task might be run while that file watch is still unexpired. If the file
    # watch renewal was skipped, the task might not run again until after expiration. To
    # avoid that situation, the file watch is always renewed here (force=True).
    file_watch, created, _ = api.renew_coupon_request_file_watch(force=True)
    return file_watch.id, file_watch.channel_id, created
