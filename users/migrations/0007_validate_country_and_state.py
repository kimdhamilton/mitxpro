# Generated by Django 2.1.7 on 2019-06-05 20:56

from django.db import migrations, models
import users.models


class Migration(migrations.Migration):

    dependencies = [("users", "0006_user_is_active_false")]

    operations = [
        migrations.AlterField(
            model_name="legaladdress",
            name="country",
            field=models.CharField(
                blank=True,
                max_length=2,
                validators=[users.models.validate_iso_3166_1_code],
            ),
        ),
        migrations.AlterField(
            model_name="legaladdress",
            name="state_or_territory",
            field=models.CharField(
                blank=True,
                max_length=6,
                validators=[users.models.validate_iso_3166_2_code],
            ),
        ),
    ]