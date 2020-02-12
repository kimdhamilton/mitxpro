"""Management command to change enrollment status"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from courses.api import create_run_enrollments
from courses.models import CourseRun
from ecommerce.api import best_coupon_for_product, create_unfulfilled_order
from ecommerce.models import Coupon, Product, Basket
from ecommerce.serializers import BasketSerializer
from users.api import fetch_user

User = get_user_model()


class Command(BaseCommand):
    """creates an enrollment for a course run"""

    help = "Creates an enrollment for a course run"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            type=str,
            help="The id, email, or username of the User",
            required=True,
        )
        parser.add_argument(
            "--run",
            type=str,
            help="The 'courseware_id' value for the CourseRun",
            required=True,
        )
        parser.add_argument(
            "--code", type=str, help="The enrollment code for the course", required=True
        )
        super().add_arguments(parser)

    def handle(self, *args, **options):
        """Handle command execution"""

        user = fetch_user(options["user"])

        run = CourseRun.objects.filter(courseware_id=options["run"]).first()
        if run is None:
            raise CommandError(
                "Could not find course run with courseware_id={}".format(options["run"])
            )

        product = Product.objects.filter(
            courseruns__courseware_id=options["run"]
        ).first()
        if product is None:
            raise CommandError(
                "No product found for that course with courseware_id={}".format(
                    options["run"]
                )
            )

        coupon = Coupon.objects.filter(coupon_code=options["code"])
        if not coupon:
            raise CommandError(
                "That enrollment code {} does not exist".format(options["code"])
            )

        # Check if the coupon is valid for the product
        coupon_version = best_coupon_for_product(product, user, code=options["code"])
        if coupon_version is None:
            raise CommandError(
                {
                    "coupons": "Enrollment code {} is invalid for course run {}".format(
                        options["code"], options["run"]
                    )
                }
            )

        basket, _ = Basket.objects.get_or_create(user=user)
        serializer = BasketSerializer(basket)
        context = [
            dict(
                "items": {"product_id": options["run"]},
                "coupons": {"code": options["code"]}
            )
        ]
        try:
            items = serializer.validate_items(context["items"])
            basket = serializer.update(basket, context)
        except ValidationError as e:
            raise CommandError(e)
        
        # make order
        order = create_unfulfilled_order(user)
        # fulfill order
        order.status = Order.FULFILLED
        order.save()
        sync_hubspot_deal(order)

        complete_order(order)
        order.save_and_log(request.user)

        if settings.ENABLE_ORDER_RECEIPTS:
            send_ecommerce_order_receipt(order)

        # successful_enrollments, edx_request_success = create_run_enrollments(
        #     user, [run]
        # )
        # if not successful_enrollments:
        #     raise CommandError("Failed to create the enrollment record")

        self.stdout.write(
            self.style.SUCCESS(
                "Enrollment created for user {} in {}".format(
                    user, options["run"]
                )
            )
        )
