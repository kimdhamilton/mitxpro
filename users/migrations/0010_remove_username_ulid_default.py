# Generated by Django 2.2.4 on 2019-09-09 19:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("users", "0009_profile_highest_education")]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=26, unique=True),
        )
    ]