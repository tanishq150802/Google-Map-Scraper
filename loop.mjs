import { parse } from 'json2csv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const EventEmitter = require('events'); 
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const express = require('express');
const pd = require("node-pandas");
const mailer = require('nodemailer');
const app = express();
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

puppeteer.use(StealthPlugin());



async function scrollPage(page, scrollContainer, cnt) {
  let lastHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);

  while (true) {
    await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
    await page.waitForTimeout(2000);
    let newHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
    if (newHeight === lastHeight) {
      break;
    }
    lastHeight = newHeight;
  }
  cnt=cnt+1;
  return cnt;
}

async function fillDataFromPage(page) {
  const dataFromPage = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".bfdHYd")).map((el) => {
      const placeUrl = el.parentElement.querySelector(".hfpxzc")?.getAttribute("href");
      const urlPattern = /!1s(?<id>[^!]+).+!3d(?<latitude>[^!]+)!4d(?<longitude>[^!]+)/gm;                     // https://regex101.com/r/KFE09c/1
      const dataId = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.id)[0];
      const latitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.latitude)[0];
      const longitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.longitude)[0];
      return {
        title: el.querySelector(".qBF1Pd")?.textContent.trim(),
        rating: el.querySelector(".MW4etd")?.textContent.trim(),
        reviews: el.querySelector(".UY7F9")?.textContent.replace("(", "").replace(")", "").trim(),
        type: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:first-child")?.textContent.replaceAll("·", "").trim(),
        address: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:last-child")?.textContent.replaceAll("·", "").trim(),
        openState: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:first-child")?.textContent.replaceAll("·", "").trim(),
        phone: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:last-child")?.textContent.replaceAll("·", "").trim(),
        website: el.querySelector("a[data-value]")?.getAttribute("href"),
        description: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(2)")?.textContent.replace("·", "").trim(),
        serviceOptions: el.querySelector(".qty3Ue")?.textContent.replaceAll("·", "").replaceAll("  ", " ").trim(),
        gpsCoordinates: {
          latitude,
          longitude,
        },
        placeUrl,
        dataId,
      };
    });
  });
  return dataFromPage;
}

const arr=[ // (keywords array)
  //"Mosque"
  // "Temple",
  // "Synagogue",
  // "Cathedral",
  // "Castle",
  // "Palace",
  // "Fort",
  // "Ruins",
  // "Beacon",
  // "Lighthouse",
  // "Windmill",
  // "Cave",
  // "Waterfall",
  // "Canyon",
  // "Valley",
  // "Volcano",
  // "Glacier",
  // "Hot Spring",
  // "Geyser",
  // "Desert",
  // "Dune",
  // "Coral Reef",
  // "Island",
  // "Archipelago",
  // "Peninsula",
  // "Coast",
  // "Seashore",
  // "Marina",
  // "Harbor",
  // "Wharf",
  // "Waterfront",
  // "Fjord",
  // "Bay",
  // "Sound",
  // "Strait",
  // "Channel",
  // "Estuary",
  // "Delta",
  // "River",
  // "Lake",
  // "Pond",
  // "Reservoir",
  // "Swamp",
  // "Wetland",
  // "Gorge",
  // "Mountain",
  // "Hill",
  // "Peak",
  // "Slope",
  // "Ridge",
  // "Plateau",
  // "Pass",
  // "Crater",
  // "Cave",
  // "Forest",
  // "Jungle",
  // "Rainforest",
  // "Woodland",
  // "Savanna",
  // "Grassland",
  // "Meadow",
  // "Steppe",
  // "Desert",
  // "Tundra",
  // "Prairie",
  // "Marsh",
  // "Bog",
  // "Creek",
  // "Stream",
  // "Brook",
  // "River",
  // "Waterfall",
  // "Rapids",
  // "Waterway",
  // "Aqueduct",
  // "Canal",
  // "Ditch",
  // "Gulf",
  // "Inlet",
  // "Strait",
  // "Firth",
  // "Sound",
  // "Isthmus",
  // "Cape",
  // "Peninsula",
  // "Spit",
  // "Headland",
  // "Bay",
  // "Cove",
  // "Anchor",
  // "Atoll",
  // "Barrier Reef",
  // "Coral Reef",
  // "Islet",
  // "Archipelago",
  // "Lagoon",
  // "Tide Pool",
  // "Puddle",
  // "Spring",
  // "Well",
  // "Geyser",
  // "Hotspring",
  // "Geothermal",
  // "Oasis",
  // "Dry Lake",
  // "Salt Flat",
  // "Iceberg",
  // "Glacier",
  // "Cirque",
  // "Ice Field",
  // "Ice Shelf",
  // "Ice Sheet",
  // "Ice Cap",
  // "Moraine",
  // "Crevasse",
  // "Serac",
  // "Ice Cave",
  // "National Park",
  // "Nature Reserve",
  // "Wildlife Sanctuary",
  // "Biosphere Reserve",
  // "Conservation Area",
  // "Protected Area",
  // "Heritage Site",
  // "UNESCO Site",
  // "Geopark",
  // "World Heritage Site",
  // "Scenic Area",
  // "Historic Site",
  // "Battlefield",
  // "Archaeological Site",
  // "Megalithic Site",
  // "Ruins",
  // "Castle",
  // "Fortress",
  // "Palace",
  // "Museum",
  // "Art Gallery",
  // "Exhibition",
  // "Science Museum",
  // "History Museum",
  // "Natural History Museum",
  // "Archaeological Museum",
  // "Ethnographic Museum",
  // "Maritime Museum",
  // "Aviation Museum",
  // "Transportation Museum",
  // "Children's Museum",
  // "Technology Museum",
  // "Botanical Garden",
  // "Zoo",
  // "Aquarium",
  // "Safari Park",
  // "Wildlife Park",
  // "Animal Sanctuary",
  // "Bird Sanctuary",
  // "Rainforest Reserve",
  // "Conservatory",
  // "Observatory",
  // "Planetarium",
  // "Botanic Park",
  // "Theme Park",
  // "Water Park",
  // "Amusement Park",
  // "Adventure Park",
  // "Family Park",
  // "Picnic Area",
  // "Campground",
  // "RV Park",
  // "Nature Trail",
  // "Hiking Trail",
  // "Cycling Trail",
  // "Walking Path",
  // "Footpath",
  // "Boardwalk",
  // "Promenade",
  // "Observation Deck",
  // "Lookout",
  // "Viewpoint",
  // "Scenic Overlook",
  // "Picnic Spot",
  // "Rest Area",
  // "Campfire Site",
  // "Campsite",
  // "Shelter",
  // "Cabin",
  // "Lodge",
  // "Hotel",
  // "Motel",
  // "Resort",
  // "Inn",
  // "Guesthouse",
  // "Hostel",
  // "Bed and Breakfast",
  // "Holiday Cottage",
  // "Chalet",
  // "Villa",
  // "Ryokan",
  // "Camp",
  // "Tent",
  // "Treehouse",
  // "Caravan",
  // "Camping Pod",
  // "Yurt",
  // "Igloo",
  // "Ski Resort",
  // "Beach Resort",
  // "Spa Resort",
  // "Golf Resort",
  // "Lake Resort",
  // "Mountain Resort",
  // "Island Resort",
  // "Safari Lodge",
  // "Eco Lodge",
  // "Castle Hotel",
  // "Palace Hotel",
  // "Historic Hotel",
  // "Boutique Hotel",
  // "Luxury Hotel",
  // "Business Hotel",
  // "Airport Hotel",
  // "Budget Hotel",
  // "Capsule Hotel",
  "Hostel"
  // "Hostel",
  // "Backpackers",
  // "Campground",
  // "Caravan Park",
  // "Trailer Park",
  // "Public Garden",
  // "Botanic Garden",
  // "Community Garden",
  // "Vegetable Garden",
  // "Rose Garden",
  // "Herb Garden",
  // "Fruit Garden",
  // "Orchard",
  // "Vineyard",
  // "Park",
  // "Urban Park",
  // "City Park",
  // "Municipal Park",
  // "Neighborhood Park",
  // "Regional Park",
  // "Provincial Park",
  // "State Park",
  // "National Park",
  // "Nature Park",
  // "Wildlife Park",
  // "Scenic Park",
  // "Historic Park",
  // "Amusement Park",
  // "Theme Park",
  // "Water Park",
  // "Botanical Park",
  // "Zoo Park",
  // "Safari Park",
  // "Recreation Park",
  // "Picnic Park",
  // "Beach Park",
  // "Mountain Park",
  // "Forest Park",
  // "Coastal Park",
  // "Wetland Park",
  // "Nature Reserve",
  // "Wetland Reserve",
  // "Wildlife Reserve",
  // "Game Reserve",
  // "Marine Reserve",
  // "Bird Reserve",
  // "Conservation Area",
  // "Protected Area",
  // "Heritage Site",
  // "World Heritage Site",
  // "UNESCO Site",
  // "Geopark",
  // "Biosphere Reserve",
  // "Scenic Area",
  // "Natural Area",
  // "Wilderness Area",
  // "Cultural Area",
  // "Archaeological Site",
  // "Historic Site",
  // "Ancient Site",
  // "Megalithic Site",
  // "Ruins",
  // "Castle",
  // "Fortress",
  // "Palace",
  // "Museum",
  // "Art Museum",
  // "History Museum",
  // "Natural History Museum",
  // "Science Museum",
  // "Archaeological Museum",
  // "Ethnographic"
]

// ["library","laboratory", "hotel", "restaurant", "zoo", "spa", "garden", "studio", "market"
// ,"museum", "animal","cafe","park","centre","agent","office","company","software", "hardware",
// [
// //   "atm"
// // ,"kiosk", "order", "pharmacy", "hospital", "clinic", "town", "village", "academy", "farm", "school"
// // ,"college", "ashram", "orphanage", "gallery", "art", "balcony", "terrace", "parking", "courier"
// // ,"post", "toilet", "lavatory", 
// // "ocean", "chai", "circus", "flat", "apartment", "hut", "hole", "tyre"
// // ,"lingerie","lot", "hostel", "pg", "industry", "factory", "drink", "jewellery", "samosa", "collectorate"
// // ,"stock", "share", "exchange", "airport","place","pet","care",
// "taxi","stand","bus","car","truck","pay"
// ,"army","canteen","token","gift","auto","air","work","bungalow","home","house","hit","gym","hot","snack",
// ,"shake","advocate","court","fort","paint","color","theatre","boat","repair","hill","people","paper","pot"
// ,"food","jam","board","rent","roll","room","class","drive","broker","poster","banner","media","saree"
// ,"print","computer","electronics","stall","cloth","ground","juice","icecream","welding","colony","nagar"
// ,"plaza","path","terminal","services","marg","temple", "mosque","gurudwar","cm","lake","garage","pump"
// ,"bread","bakery","cake","sweets","bar","club","pool","swimming","society","community","milk","dairy","mess"
// ,"lounge","pool","swimming","warehouse","mall","market","mill","sanctuary","national","education"
// ,"money","finance","footbal","construction","barber", "film"];
console.log(arr.length);
var k=0; var localPlacesInfo = [];
while(k<arr.length) {
  var cnt=0;
  const requestParams = {
    baseURL: `http://google.com`,
    query: arr[k], 
    // start: 100,                                         // what we want to search
    // coordinates: "@47.6040174,-122.1854488,11z",                 // parameter defines GPS coordinates of location where you want your query to be applied
    hl: "en",                                                    // parameter defines the language to use for the Google maps search
  };
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const URL = `${requestParams.baseURL}/maps/search/${requestParams.query}/${requestParams.coordinates}?hl=${requestParams.hl}`;

  await page.setDefaultNavigationTimeout(0);
  await page.goto(URL);

  // await page.waitForNavigation();

  const scrollContainer = ".m6QErb[aria-label]";

  

  // while (true) {
  await page.waitForTimeout(0);
  // const nextPageBtn = await page.$("#eY4Fjd:not([disabled])");
  // if (!nextPageBtn) break;
  console.log(cnt);
  const p=cnt;
  var res=await scrollPage(page, scrollContainer,cnt);
  console.log(res);
  
  // .then(()=>console.log(cnt));
  // console.log(cnt);
  localPlacesInfo.push(...(await fillDataFromPage(page)));
  const csv = parse(localPlacesInfo);
  fs.writeFile("input.csv", csv, //CSV
  {
    encoding: "utf8",
    flag: "w",
    mode: 0o666
  },
  (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
    }
  });
  
  k=k+1;
  await browser.close();
}
let sender = mailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'userid',
      pass: 'pwd'
  }
});

let mail = {
  from: 'senderid',
  to:'recieverid',
  subject: 'Test',
  text: 'sent via node',
  html:
      'This pipeline contains extraction and mailing',
attachments: [
  {
      filename: 'filename.csv',
      path: '\\path\\' + 'filename.csv',
      cid: 'uniq-data.csv'
  }
]
};

sender.sendMail(mail, function (error, info) {
  if (error) {
      console.log(error);
  } else {
      console.log('Email sent successfully: '
          + info.response);
  }
}); 
// console.log(len(df))
// df.toCsv('end.csv')

// const jsonContent = JSON.stringify(localPlacesInfo);
// fs.writeFile("huge.json", jsonContent, 'utf8', function (err) { //JSON
//   if (err) {
//       return console.log(err);
//   }

//   console.log("The file was saved!");
// });
