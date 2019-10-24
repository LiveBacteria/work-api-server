# Cleanharbors DVIR to PDF API server
Utilizing node and express, this project serves as a backend handler to the frontend counterpart. In general, this project allows to accelerate the Transportation Compliance Coordinator workflow at clean harbors.

## Usage
This server is designed to be used in conjunction with Cleanharbors intrasite and the frontend project, [Cleanharbors Frontend](https://github.com/LiveBacteria/cleanharbors-frontend). Utilizing injected code on 
the intrasite, post iframe DVIR data back to this server to be stored and or downloaded in compiled and 
relevantly named file sets.

## Setup
This project needs valid environment variables to run, due to implenting the `dotenv` npm package. Create a `.env` file and have its contents include:

```
apiUser: UserGoesHere
apiAccessKey: demoAuth
```

The default login for this server when prompted for by the frontend will be:
```
user: Livebacteria
password: demoAuth
```

Using `npm start` will start the server.

**Please note that this server needs to be running before attempting to connect with the frontend.**

## Issues
* Handling and storing data when deployed to Heroku √
* Sending iframe content as POST data to server √
* Recieving and converting iframe content to be storable and readable on serverside √
* Delay in cloud functionality leading to corrupted zip downloads --

## Solutions
* Utilise Heroku ephemeral storage for html to pdf / image --
* Created and connected Google Firestore Cloud Storage --
* Ability to run locally alongside electron frontend deployment √
* Integrate with Frontend

## Features
* Compile and mass-download DVIR
* Compile and mass-download APR reports
* Weekly Duties solutions: DVIR, APR, ELD

## Future Features
* Utilize either OCR for ELD pdf data conversion, or convert ELD pdf to readable standard csv / JSON / text String
* ELD Log APR reconnaissance

## License 
* Copyright Tyler Poore

