# Generated by Django 2.1.9 on 2019-06-27 17:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("cms", "0036_make_subhead_optional")]

    operations = [
        migrations.AddField(
            model_name="coursepage",
            name="featured",
            field=models.BooleanField(
                blank=True,
                default=False,
                help_text="When checked, product will be shown as featured.",
            ),
        ),
        migrations.AddField(
            model_name="programpage",
            name="featured",
            field=models.BooleanField(
                blank=True,
                default=False,
                help_text="When checked, product will be shown as featured.",
            ),
        ),
    ]