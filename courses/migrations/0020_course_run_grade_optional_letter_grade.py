# Generated by Django 2.2.4 on 2019-08-19 13:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "courses",
            "0019_courseruncertificate_courserungrade_courserungradeaudit_programcertificate",
        )
    ]

    operations = [
        migrations.AlterField(
            model_name="courserungrade",
            name="letter_grade",
            field=models.CharField(blank=True, max_length=6, null=True),
        )
    ]