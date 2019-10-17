# Cleanharbors DVIR to PDF API server
* Utilizes Express as backend API

## Usage
This server is designed to be used in conjunction with Cleanharbors intrasite and the frontend variant. Utilizing injected code on 
the intrasite, post iframe DVIR data back to this server to be stored and or downloaded in compiled and 
relevantly named file sets.

## Issues
* Handling and storing data when deployed to Heroku √
* Sending iframe content as POST data to server √
* Recieving and converting iframe content to be storable and readable on serverside √

## Solutions
* Utilise Heroku ephemeral storage for html to pdf / image --
* Created and connected Google Firestore Cloud Storage √

## Features
* Mass-download DVIR
* Mass-download report

