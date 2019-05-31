# Generated by Django 2.1.7 on 2019-05-28 12:40

import cms.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("wagtailcore", "0041_group_collection_permissions_verbose_name_plural"),
        ("cms", "0027_imagecarouselpage"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseIndexPage",
            fields=[
                (
                    "page_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="wagtailcore.Page",
                    ),
                )
            ],
            options={"abstract": False},
            bases=(cms.models.CourseObjectIndexPage, "wagtailcore.page"),
        ),
        migrations.CreateModel(
            name="ProgramIndexPage",
            fields=[
                (
                    "page_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="wagtailcore.Page",
                    ),
                )
            ],
            options={"abstract": False},
            bases=(cms.models.CourseObjectIndexPage, "wagtailcore.page"),
        ),
    ]