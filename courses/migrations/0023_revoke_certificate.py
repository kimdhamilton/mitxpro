# Generated by Django 2.2.3 on 2019-10-23 13:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("courses", "0022_topics")]

    operations = [
        migrations.AddField(
            model_name="courseruncertificate",
            name="is_revoked",
            field=models.BooleanField(
                default=False,
                help_text="Indicates whether or not the certificate is revoked",
                verbose_name="revoked",
            ),
        ),
        migrations.AddField(
            model_name="programcertificate",
            name="is_revoked",
            field=models.BooleanField(
                default=False,
                help_text="Indicates whether or not the certificate is revoked",
                verbose_name="revoked",
            ),
        ),
    ]
