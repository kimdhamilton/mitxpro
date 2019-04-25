# Generated by Django 2.1.7 on 2019-04-19 05:44

from django.db import migrations
import wagtail.core.fields


class Migration(migrations.Migration):

    dependencies = [("cms", "0003_add_video_url_bg_image")]

    operations = [
        migrations.AddField(
            model_name="coursepage",
            name="video_title",
            field=wagtail.core.fields.RichTextField(
                blank=True, help_text="The title to be displayed for the course video"
            ),
        )
    ]