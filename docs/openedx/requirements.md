---
layout: default
parent: Configure Open edX
nav_order: 1
---

## Additional Requirements

Below are documented additional requirements that Open edX needs in order to work in concert with xPro.

### Install `social-auth-mitxpro` in LMS

There are two options for this:

#### Install via pip

- `pip install social-auth-mitxpro`

#### Install from local Build

- Checkout the [social-auth-mitxpro](https://github.com/mitodl/social-auth-mitxpro) project and build the package per the project instructions
- Copy the `social-auth-mitxpro-$VERSION.tar.gz` file into devstack's `edx-platform` directory
- In devstack, run `make lms-shell` and within that shell `pip install social-auth-mitxpro-$VERSION.tar.gz`
  - To update to a new development version without having to actually bump the package version, simply `pip uninstall social-auth-mitxpro`, then install again

### Install `mitxpro-openedx-extensions` in LMS

There are two options for this:

#### Install via pip

- `pip install mitxpro-openedx-extensions`

#### Install from local Build

- Checkout the [mitxpro-openedx-extensions](https://github.com/mitodl/mitxpro-openedx-extensions) project and build the package per the project instructions
- Copy the `mitxpro-openedx-extensions-$VERSION.tar.gz` file into devstack's `edx-platform` directory
- In devstack, run `make lms-shell` and within that shell `pip install mitxpro-openedx-extensions-$VERSION.tar.gz`
  - To update to a new development version without having to actually bump the package version, simply `pip uninstall -y mitxpro-openedx-extensions`, then install again
