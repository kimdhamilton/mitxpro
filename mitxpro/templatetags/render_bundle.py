"""Templatetags for rendering script tags"""

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

from webpack_loader.utils import get_loader

from mitxpro.utils import public_path


register = template.Library()


def _get_bundle(request, bundle_name):
    """
    Update bundle URLs to handle webpack hot reloading correctly if DEBUG=True

    Args:
        request (django.http.request.HttpRequest): A request
        bundle_name (str): The name of the webpack bundle

    Returns:
        iterable of dict:
            The chunks of the bundle. Usually there's only one but I suppose you could have
            CSS and JS chunks for one bundle for example
    """
    if not settings.DISABLE_WEBPACK_LOADER_STATS:
        for chunk in get_loader("DEFAULT").get_bundle(bundle_name):
            chunk_copy = dict(chunk)
            chunk_copy["url"] = "{host_url}/{bundle}".format(
                host_url=public_path(request).rstrip("/"), bundle=chunk["name"]
            )
            yield chunk_copy


@register.simple_tag(takes_context=True)
def render_bundle(context, bundle_name, added_attrs=""):
    """
    Render the script tags for a Webpack bundle

    We use this instead of webpack_loader.templatetags.webpack_loader.render_bundle because we want to substitute
    a dynamic URL for webpack dev environments. Maybe in the future we should refactor to use publicPath
    instead for this.

    Args:
        context (dict): The context for rendering the template (includes request)
        bundle_name (str): The name of the bundle to render
        added_attrs (str): Optional string of HTML attributes to add to the script/link tag

    Returns:
        django.utils.safestring.SafeText:
    """
    try:
        bundle = _get_bundle(context["request"], bundle_name)
        return _render_tags(bundle, added_attrs)
    except OSError:
        # webpack-stats.json doesn't exist
        return mark_safe("")


def _render_tags(bundle, added_attrs=""):
    """
    Outputs tags for template rendering.
    Adapted from webpack_loader.utils.get_as_tags and webpack_loader.templatetags.webpack_loader.

    Args:
        bundle (iterable of dict): The information about a webpack bundle
        added_attrs (str): Optional string of HTML attributes to add to the script/link tag

    Returns:
        django.utils.safestring.SafeText: HTML for rendering bundles
    """

    tags = []
    for chunk in bundle:
        if chunk["name"].endswith((".js", ".js.gz")):
            tags.append(
                ('<script type="text/javascript" src="{}" {} ></script>').format(
                    chunk["url"], added_attrs
                )
            )
        elif chunk["name"].endswith((".css", ".css.gz")):
            tags.append(
                ('<link type="text/css" href="{}" rel="stylesheet" {} />').format(
                    chunk["url"], added_attrs
                )
            )
    return mark_safe("\n".join(tags))
