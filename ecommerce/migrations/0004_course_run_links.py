# Generated by Django 2.1.7 on 2019-04-17 18:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0006_update_related_name"),
        ("ecommerce", "0003_invoice_to_payment"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseRunEnrollment",
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
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="ecommerce.Order",
                    ),
                ),
                (
                    "run",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="courses.CourseRun",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="CourseRunSelection",
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
                (
                    "basket",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="ecommerce.Basket",
                    ),
                ),
                (
                    "run",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="courses.CourseRun",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
        migrations.AlterField(
            model_name="product",
            name="content_type",
            field=models.ForeignKey(
                help_text="content_object is a link to either a Course or a Program",
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                to="contenttypes.ContentType",
            ),
        ),
    ]