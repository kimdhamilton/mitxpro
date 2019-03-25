# Generated by Django 2.1.7 on 2019-03-25 12:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courseware", "0002_add_courseware_user"),
    ]

    operations = [
        migrations.CreateModel(
            name="OpenEdxApiAuth",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_on", models.DateTimeField(auto_now_add=True)),
                ("updated_on", models.DateTimeField(auto_now=True)),
                ("refresh_token", models.CharField(max_length=128)),
                ("access_token", models.CharField(max_length=128, null=True)),
                ("access_token_expires_on", models.DateTimeField(null=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AlterIndexTogether(
            name="openedxapiauth", index_together={("user", "access_token_expires_on")}
        ),
    ]
