"""Wagtail page factories"""
import factory
import wagtail_factories

from cms.models import (
    ProgramPage,
    CoursePage,
    LearningOutcomesPage,
    LearningTechniquesPage,
)
from cms.blocks import LearningTechniqueBlock
from courses.factories import ProgramFactory, CourseFactory


class ProgramPageFactory(wagtail_factories.PageFactory):
    """ProgramPage factory class"""

    program = factory.SubFactory(ProgramFactory)
    subhead = factory.fuzzy.FuzzyText(prefix="Subhead ")
    thumbnail_image = factory.SubFactory(wagtail_factories.ImageFactory)

    class Meta:
        model = ProgramPage


class CoursePageFactory(wagtail_factories.PageFactory):
    """CoursePage factory class"""

    course = factory.SubFactory(CourseFactory)
    subhead = factory.fuzzy.FuzzyText(prefix="Subhead ")
    thumbnail_image = factory.SubFactory(wagtail_factories.ImageFactory)
    background_image = factory.SubFactory(wagtail_factories.ImageFactory)

    class Meta:
        model = CoursePage


class LearningOutcomesPageFactory(wagtail_factories.PageFactory):
    """LearningOutcomesPage factory class"""

    heading = factory.fuzzy.FuzzyText(prefix="heading ")
    sub_heading = factory.fuzzy.FuzzyText(prefix="Sub-heading ")
    outcome_items = factory.SubFactory(wagtail_factories.StreamFieldFactory)

    class Meta:
        model = LearningOutcomesPage


class LearningTechniquesItemFactory(wagtail_factories.StructBlockFactory):
    """LearningTechniquesItem factory class"""

    heading = factory.fuzzy.FuzzyText(prefix="heading ")
    sub_heading = factory.fuzzy.FuzzyText(prefix="Sub-heading ")
    image = factory.SubFactory(wagtail_factories.ImageFactory)

    class Meta:
        model = LearningTechniqueBlock


class LearningTechniquesPageFactory(wagtail_factories.PageFactory):
    """LearningTechniquesPage factory class"""

    technique_items = wagtail_factories.StreamFieldFactory(
        {"techniques": LearningTechniquesItemFactory}
    )

    class Meta:
        model = LearningTechniquesPage
