# Generated by Django 2.2.8 on 2019-12-19 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ecommerce", "0023_bulkcouponassignment_assignment_sheet_last_modified")
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="visible_in_bulk_form",
            field=models.BooleanField(
                default=True,
                help_text="If it is unchecked then this product will not be listed in the product drop-down on the bulk purchase form at /ecommerce/bulk.",
            ),
        )
    ]
