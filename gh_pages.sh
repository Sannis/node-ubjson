#!/bin/bash

BRANCH=`git branch 2> /dev/null | grep "*" | sed 's#*\ \(.*\)#\1#'`
if [ "$BRANCH" != "master" ]
then
    exit 1
fi

DESC=`git describe --tags`

# Update master branch
make doc
git add doc/*.html doc/api/*.html
git ci -m "Update docs to $DESC"

# Update gh-pages branch
TMP=`mktemp --tmpdir -d gh_pages.XXXXXXXXXX 2> /dev/null || mktemp -d -t gh_pages`
cp -r ./doc/* $TMP
rm -f $TMP/*~
git checkout gh-pages
cp -r $TMP/* ./
git add ./*.js ./*.html
git ci -m "Update docs to $DESC"
git checkout master
rm -rf $TMP
