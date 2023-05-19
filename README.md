# Google Map Scraper using Node.js

### Extracting multiple locations' data using keyword

By : [Tanishq Selot](https://github.com/tanishq150802)

## Requirements
* Python 3.10
* Node.js 18.16
* Pandas
* Regex

## Node.js packages
* puppeteer 20.2.0
* puppeteer-extra 3.3.6
* puppeteer-extra-plugin-stealth 2.11.2
* json2csv 6.0.0-alpha.2
* nodemailer 6.9.2

All the code is contained within **loop.mjs**. 

### Features
* Extracts 8k row data within an hour.
* It can be run in daemon and data will be recieved on mail
* Every data row contains phone numbers (irrelevant data is filtered)
* 1000s of keyword data can be extracted without any interruption.

### Steps

* Puppeteer launches the browser.
* scrollPage function scrolls the page generated via the URL created using keyword.
* fillDataFromPage extracts ## [title,	rating,	reviews,	type,	address,	serviceOptions,	gpsCoordinates,	website,	phone]
* This data is pushed to an array which is rewritten in to CSV after each keyword run (loop).
* This helps in realtime data extraction check.
* Counter helps in bypassing the asynchronous nature of the loop and starts the process for next keyword only when the previous keyword data is pushed (to avoid load on browser)
* This is cleaned by python transformer to extract important contact info using regex.
* Finally, nodemailer is used for mailing the CSV.

![image](https://github.com/tanishq150802/Google-Map-Scraper/assets/81608921/fc6771ec-4cf1-461c-a2c7-46f5588195eb)

### Future Plan

I plan on creating an UI for this system where the user inputs keyword and email ID to get the CSV file in the inbox. Pipelining will help the code to run in one go.

### References
* [Node.js code flow](https://serpapi.com/blog/web-scraping-google-maps-places-with-nodejs/)
