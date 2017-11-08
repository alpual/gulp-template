#!/bin/env bash

# $1 = /path/to/images

case ${1-} in '') echo "$0: Need a directory" >&2; exit 1;; esac
# Iterate through files 
for f in $(find ${1} -name '*.jpg' -o -name '*.jpeg' -o -name '*.JPG' -o -name '*.JPEG'); do 
	# Get the last mod date of the file 
    fileMod=$(date -r ${f} +%s); 
     
    # Get the directory 
    dir=$(dirname "${f}")"/";
     
    # Get opt filename 
    optFileName=$(basename "${f}")".opt"; 
     
    # Get the full optFileName path 
    optFullPath="${dir}${optFileName}"; 
     
    # Set last opt time 
    lastOptTime=0; 
     
    # Check if a file for optimization time exists 
    if [ -f "${optFullPath}" ]; then 
         lastOptTime=$(date -r ${optFullPath} +%s); 
    fi; 
     
    # Check if last opt time is less than last mod time 
    if (( lastOptTime < fileMod )); then 
        # Mention optimization 
        echo "Optimizing ${f}"; 
         
        # Run optimization 
        /usr/bin/convert ${f} -sampling-factor 4:2:0 -strip -quality 70 -interlace JPEG ${f}; 
         
        # Create the last opt time file 
        touch ${optFullPath}; 
    fi 
done;

echo "Finished compressing ${1}";
