"""Tests for users.serializers"""
import pytest

from users.serializers import LegalAddressSerializer, UserSerializer


# pylint:disable=redefined-outer-name


@pytest.fixture()
def sample_address():
    """ Return a legal address"""
    return {
        "first_name": "Test",
        "last_name": "User",
        "street_address_1": "11 Main Street",
        "street_address_2": "Apt # 12",
        "country": "US",
        "state_or_territory": "US-CO",
        "city": "Boulder",
        "postal_code": "80309",
    }


def test_validate_legal_address(sample_address):
    """ Test that correct address data validates"""
    serializer = LegalAddressSerializer(data=sample_address)
    assert serializer.is_valid() is True


@pytest.mark.parametrize(
    "field,value,error",
    [
        ["first_name", "", "This field may not be blank."],
        ["last_name", "", "This field may not be blank."],
        ["street_address", [], "street_address must be a list of street lines"],
        [
            "street_address",
            ["a", "b", "c", "d", "e", "f"],
            "street_address list must be 5 items or less",
        ],
        [
            "street_address",
            ["x" * 61],
            "street_address lines must be 60 characters or less",
        ],
        ["country", "", "This field may not be blank."],
        ["country", None, "This field may not be null."],
        ["state_or_territory", "", "State/territory is required for United States"],
        [
            "state_or_territory",
            "CA-QC",
            "Quebec is not a valid state or territory of United States",
        ],
        ["city", "", "This field may not be blank."],
        ["postal_code", "", "Postal Code is required for United States"],
        [
            "postal_code",
            "3082",
            "Postal Code must be in the format 'NNNNN' or 'NNNNN-NNNNN'",
        ],
    ],
)
def test_validate_required_fields_US_CA(sample_address, field, value, error):
    """ Test that missing required fields causes a validation error"""
    sample_address[field] = value
    serializer = LegalAddressSerializer(data=sample_address)
    assert serializer.is_valid() is False
    assert str(serializer.errors[field][0]) == error


@pytest.mark.parametrize(
    "data,error",
    [
        [
            {"country": "US", "state_or_territory": "US-MA", "postal_code": "2183"},
            "Postal Code must be in the format 'NNNNN' or 'NNNNN-NNNNN'",
        ],
        [
            {"country": "CA", "state_or_territory": "CA-BC", "postal_code": "AFA D"},
            "Postal Code must be in the format 'ANA NAN'",
        ],
    ],
)
def test_validate_postal_code_formats(sample_address, data, error):
    """Test that correct errors are shown for invalid US/CA postal code formats"""
    sample_address.update(data)
    serializer = LegalAddressSerializer(data=sample_address)
    assert serializer.is_valid() is False
    assert str(serializer.errors["postal_code"][0]) == error


def test_validate_optional_country_data(sample_address):
    """Test that state_or_territory and postal_code are optional for other countries besides US/CA"""
    sample_address.update(
        {"country": "FR", "state_or_territory": "", "postal_code": ""}
    )
    assert LegalAddressSerializer(data=sample_address).is_valid()


def test_update_user_serializer(user, sample_address):
    """ Test that a UserSerializer can be updated properly """
    serializer = UserSerializer(
        instance=user,
        data={"password": "AgJw0123", "legal_address": sample_address},
        partial=True,
    )
    assert serializer.is_valid()
    serializer.save()
    assert user.legal_address.street_address_1 == sample_address.get("street_address_1")