"""Sheets app models"""
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError

from mitxpro.models import TimestampedModel, SingletonModel


class GoogleApiAuth(TimestampedModel, SingletonModel):
    """Model that stores OAuth credentials to be used to authenticate with the Google API"""

    requesting_user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    access_token = models.CharField(max_length=2048)
    refresh_token = models.CharField(null=True, max_length=512)


class CouponGenerationRequest(TimestampedModel):
    """Model that represents a request to create bulk enrollment coupons"""

    purchase_order_id = models.CharField(max_length=100, db_index=True, null=False)
    completed = models.BooleanField(default=False)


class GoogleFileWatch(TimestampedModel):
    """
    Model that represents a file watch/push notification/webhook that was set up via the Google API for
    some Google Drive file
    """

    file_id = models.CharField(max_length=100, db_index=True, null=False)
    channel_id = models.CharField(max_length=50, db_index=True, null=False)
    version = models.IntegerField(db_index=True, unique=True, null=True, blank=True)
    activation_date = models.DateTimeField(null=False)
    expiration_date = models.DateTimeField(db_index=True, unique=True, null=False)

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        if (
            force_insert
            and self._meta.model.objects.filter(file_id=self.file_id).count() > 0
        ):
            raise ValidationError(
                "Only one {} object should exist for each unique file_id (file_id provided: {}). "
                "Update the existing object instead of creating a new one.".format(
                    self.__class__.__name__, self.file_id
                )
            )
        return super().save(
            force_insert=force_insert,
            force_update=force_update,
            using=using,
            update_fields=update_fields,
        )

    def __str__(self):
        return "GoogleFileWatch: id={}, channel_id={}, file_id={}, expires={}".format(
            self.id, self.channel_id, self.file_id, self.expiration_date.isoformat()
        )