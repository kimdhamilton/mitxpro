# Generated by Django 2.2.4 on 2019-12-10 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("ecommerce", "0022_bulk_assignment_metadata_changes")]

    operations = [
        migrations.AddField(
            model_name="bulkcouponassignment",
            name="assignment_sheet_last_modified",
            field=models.DateTimeField(blank=True, null=True),
        )
    ]