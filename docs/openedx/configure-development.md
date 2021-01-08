---
layout: default
parent: Configure Open edX
nav_order: 0
---

## Setup Devstack

Following steps are inspired by [edx-devstack](https://github.com/edx/devstack).

### Clone edx/devstack

```bash
git clone https://github.com/edx/devstack
cd devstack
git checkout open-release/ironwood.master
make requirements
export OPENEDX_RELEASE=ironwood.master
make dev.clone
```

### Clone and checkout edx-platform (if not already).
```bash
git clone https://github.com/mitodl/edx-platform
git checkout xpro/ironwood
```

### Pull latest images and run provision

```bash
make pull
make dev.provision
```

### Start your servers

```bash
make dev.up
```

### Stop your servers

```bash
make stop
```
