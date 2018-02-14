[![Build Status](https://travis-ci.org/mendixlabs/tag.svg?branch=master)](https://travis-ci.org/mendixlabs/tag)
[![Dependency Status](https://david-dm.org/mendixlabs/tag.svg)](https://david-dm.org/mendixlabs/tag)
[![Dev Dependency Status](https://david-dm.org/mendixlabs/tag.svg#info=devDependencies)](https://david-dm.org/mendixlabs/tag#info=devDependencies)
[![codecov](https://codecov.io/gh/mendixlabs/tag/branch/master/graph/badge.svg)](https://codecov.io/gh/mendixlabs/tag)

# Tag
Display, add, update and remove tags.

## Features
* Create new tag object when non existent
* Lazy load tag suggestions

## Dependencies
Mendix 7.7.1

## Demo project
https://tag100.mxapps.io

![Demo](assets/Demo.gif)

## Usage
Place the widget in a data view. The entity have many to many relations with a tag. Just like the core Mendix Reference set selector

Enable creation, lazyloading, suggestions and set taglimit

![General](assets/General.PNG)

Add limit message, placeholder and tag style.

![Appearance](assets/Appearance.PNG)

### Data source configuration

![Data source](/assets/entity.png)
 - Model Configuration

![Data source](/assets/EntitySource.png)
 - On `Tag entity` option of the `Data source` tab, browse and 
 select the "entity" you want.
 
 ![Data source](/assets/Attribute.png)
 
 - On the `Tag attribute` option of the `Data source` tab, browse and 
 select the attribute on the tag entity selected above. 

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestion for improvement at https://github.com/mendixlabs/tag/issues

## Development and contribution
Please follow [development guide](/development.md). 