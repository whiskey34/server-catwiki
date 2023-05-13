const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// if something happens to start with .cjs format 
// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import fetch from 'node-fetch';


// const port =5000;

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const port = process.env.PORT || 5000;

const mostBreed = process.env.MOST_POPULAR_BREEDS_URL;
const topBreeds = process.env.TOP_10_BREEDS_URL;
const allBreedsUrl = process.env.ALL_BREEDS_URL;
const apiKeyAuth = process.env.API_KEY;


// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

// untuk tesing nyambung apa engga ke vue js axiosnya
// app.get('/api/test', function(req, res) {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Server is active!\n');
// });

// endpoint untuk ke vue client dan processing si api nya

// to get all breeds
// app.get('/breed', async (req, res) => {
//   try {
//     const allbreed = 'https://api.thecatapi.com/v1/breeds'
//     const response = await fetch (allbreed, { headers: { 'x-api-key': apiKeyAuth}});
//     const data = await response.json();
//     const breedNames = data.map(breed => ({ id: breed.id , name: breed.name}));
//     res.json({ allBreed: breedNames });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Server error'});
//   }
// });

// endpoint untul most searched breeds
app.get('/breed/most-searched-breeds', async (req, res) => {
  try {
    const response = await fetch(mostBreed, {
      headers: { 'x-api-key': apiKeyAuth }
    });
    const data = await response.json();
    res.json({ mostBreed: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Endpoint to show top 10 searched cats breeds
// app.get('/breed/top-ten-breeds', async (req, res) => {
//   try {
//     const topBreedsUrl = 'https://api.thecatapi.com/v1/breeds?limit=10';
//     const response = await fetch(topBreedsUrl);

//     const data = await response.json();
//     const topTen = data.map(breed => ({
//       name: breed.name,
//       description: breed.description,
//       image: breed.image && breed.image.url
//     }));
//     res.json({ topTen });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

app.get('/breed/top-ten-breeds', async (req, res) => {
  try {
    // const topBreedsUrl = 'https://api.thecatapi.com/v1/breeds?limit=10';
    const topBreedsUrl = 'https://api.thecatapi.com/v1/breeds?order=desc&sort_by=total_searches&limit=10';
    const response = await fetch(topBreedsUrl);
    const data = await response.json();

    const topTen = [];

    for (let i = 0; i < data.length; i++) {
      const breed = data[i];
      const breedUrl = `https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}`;
      const breedResponse = await fetch(breedUrl);
      const breedData = await breedResponse.json();

      const name = breed.name;
      const description = breed.description;
      const imageUrl = breedData[0].url;

      topTen.push({ name, description, imageUrl });
    }

    console.log(topTen);

    res.json({ topTen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});





// Endpoint to show cat breed that for searchable

app.get('/breed/:breedName', async (req, res) => {
  try {
    const { breedName } = req.params;
    const url = `${allBreedsUrl}`;
    const response = await fetch(url, { headers: { 'x-api-key': apiKeyAuth } });
    const breeds = await response.json();

    // Filter the breeds by name
    const filteredBreeds = breeds.filter(breed => breed.name.toLowerCase().includes(decodeURIComponent(breedName).toLowerCase()));


    // Retrieve the image data for each breed
    const breedDataPromises = filteredBreeds.map(async breed => {
      const imageDataResponse = await fetch(`https://api.thecatapi.com/v1/images/${breed.reference_image_id}`, { headers: { 'x-api-key': apiKeyAuth } });
      const imageData = await imageDataResponse.json();
      console.log(`Breed ${breed.name} image data:`, imageData);
      return { ...breed, imageData };
    });
    const breedData = await Promise.all(breedDataPromises);

    if (breedData.length > 0) {
      res.status(200).json(breedData);
    } else {
      res.status(404).send(`Breed ${breedName} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});




app.listen(port, () => {
  console.log(`server has online and listening on port ${port}`);
});