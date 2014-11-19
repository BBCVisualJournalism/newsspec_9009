# Newsspec-9474

Jihadi month global attacks map

## Getting started

Set up the project

```
grunt
```

Make images responsive

```
grunt images
```

Build World Service version

```
grunt translate
```

### Data
There are 2 data sources that this project loads (global_map_data.json and countries_data.json). Both of these files are created via a node task in git with the project name newsspec_9473. The 9473 node task outputs the files locally which you then copy over to this project in the source/assets folder. Running the default grunt task also runs the 'copy:assets' task which copies the json files over to content/{languageName}/assets directory.

## iFrame scaffold

This project was built using the iFrame scaffold v1.5.7

## License
Copyright (c) 2014 BBC
