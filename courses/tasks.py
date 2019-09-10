"""
Tasks for the courses app
"""
import logging
from requests.exceptions import HTTPError
from mitxpro.celery import app
from mitxpro.utils import now_in_utc
from courses.models import CourseRun, CourseRunCertificate
from courses.utils import ensure_course_run_grade, process_course_run_grade_certificate
from courseware.api import get_edx_grades_with_users

log = logging.getLogger(__name__)


@app.task
def generate_course_certificates():
    """
    Task to generate certificates for courses.
    """
    now = now_in_utc()
    course_runs = CourseRun.objects.filter(end_date__lt=now).exclude(
        id__in=CourseRunCertificate.objects.values_list("course_run__id", flat=True)
    )

    for run in course_runs:
        edx_grade_user_iter = exception_logging_generator(
            get_edx_grades_with_users(run)
        )
        created_grades_count, updated_grades_count, generated_certificates_count = (
            0,
            0,
            0,
        )
        for edx_grade, user in edx_grade_user_iter:
            course_run_grade, created, updated = ensure_course_run_grade(
                user=user, course_run=run, edx_grade=edx_grade, should_update=True
            )

            if created:
                created_grades_count += 1
            elif updated:
                updated_grades_count += 1

            _, created, deleted = process_course_run_grade_certificate(
                course_run_grade=course_run_grade
            )

            if deleted:
                log.warning(
                    "Certificate deleted for user %s and course_run %s", user, run
                )
            elif created:
                generated_certificates_count += 1

        log.info(
            "Finished processing course run %s: created grades for %d users, "
            "updated grades for %d users, generated certificates for %d users",
            run,
            created_grades_count,
            updated_grades_count,
            generated_certificates_count,
        )


def exception_logging_generator(generator):
    """Returns a new generator that logs exceptions from the given generator and continues with iteration"""
    while True:
        try:
            yield next(generator)
        except StopIteration:
            return
        except HTTPError as exc:
            log.exception("EdX API error for fetching user grades %s:", exc)
        except Exception as exp:  # pylint: disable=broad-except
            log.exception("Error fetching user grades from edX %s:", exp)