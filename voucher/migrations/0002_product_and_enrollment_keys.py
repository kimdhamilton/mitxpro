# Generated by Django 2.1.7 on 2019-06-06 17:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0009_enrollment_statuses"),
        ("ecommerce", "0012_coupon_assignment_redeem_flag"),
        ("voucher", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="voucher",
            name="enrollment",
            field=models.OneToOneField(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="voucher",
                to="courses.CourseRunEnrollment",
            ),
        ),
        migrations.AddField(
            model_name="voucher",
            name="product",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="ecommerce.Product",
            ),
        ),
    ]