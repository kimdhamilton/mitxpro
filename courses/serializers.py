"""
Course model serializers
"""
from rest_framework import serializers

from courses import models
from mitxpro.serializers import WriteableSerializerMethodField


class ProgramSerializer(serializers.ModelSerializer):
    """Program model serializer"""

    title = WriteableSerializerMethodField()
    thumbnail_image = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)

    @staticmethod
    def _get_page_property(program, prop_name):
        """Gets a property from the associated Wagtail page if that page exists"""
        return (
            None
            if not hasattr(program, "programpage")
            else getattr(program.programpage, prop_name, None)
        )

    def get_title(self, program):
        """Gets the value for the serialized 'title' field"""
        return self._get_page_property(program, "title") or program.title

    def get_thumbnail_image(self, program):
        """Gets the value for the serialized 'thumbnail_image' field"""
        return self._get_page_property(program, "thumbnail_image") or None

    def get_description(self, program):
        """Gets the value for the serialized 'description' field"""
        return self._get_page_property(program, "description") or None

    class Meta:
        model = models.Program
        fields = "__all__"
        extra_fields = {"thumbnail": {"readonly": True}}


class CourseSerializer(serializers.ModelSerializer):
    """Course model serializer"""

    title = WriteableSerializerMethodField()
    thumbnail_image = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)

    @staticmethod
    def _get_page_property(course, prop_name):
        """Gets a property from the associated Wagtail page if that page exists"""
        return (
            None
            if not hasattr(course, "coursepage")
            else getattr(course.coursepage, prop_name, None)
        )

    def get_title(self, course):
        """Gets the value for the serialized 'title' field"""
        return self._get_page_property(course, "title") or course.title

    def get_thumbnail_image(self, course):
        """Gets the value for the serialized 'thumbnail_image' field"""
        return self._get_page_property(course, "thumbnail_image") or None

    def get_description(self, course):
        """Gets the value for the serialized 'description' field"""
        return self._get_page_property(course, "description") or None

    class Meta:
        model = models.Course
        fields = "__all__"


class CourseRunSerializer(serializers.ModelSerializer):
    """CourseRun model serializer"""

    class Meta:
        model = models.CourseRun
        fields = "__all__"
