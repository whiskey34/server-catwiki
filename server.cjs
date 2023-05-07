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
app.get('/api/top-searched-breeds', async (req, res) => {
  try {
    const response = await axios.get(`${top10BreedsUrl}`);
    const breeds = response.data.map((breed) => breed.name);
    const imageData = response.data;

    // convert image data to Base64 encoding
    const base64Image = Buffer.from(imageData, 'binary').toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64Image}`;

    res.send(dataURI);
    res.json(breeds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching top 10 breeds' });
  }
});


// Endpoint to show cat breed that for searchable


app.get('/breed/:breedName', async (req, res) => {
  try {
    const { breedName } = req.params;
    // const url = `https://api.thecatapi.com/v1/breeds`;
    const url = `${allBreedsUrl}`;
    // const response = await axios.get(url);
    const response = await fetch(url, { headers: { 'x-api-key': apiKeyAuth } });
    const filteredBreeds = response.data.filter(breed => breed.name.toLowerCase().includes(decodeURIComponent(breedName).toLowerCase()));
    // console.log(filteredBreeds);
    
    // Fetch the image data for each breed
    const breedDataPromises = filteredBreeds.map(async breed => {
      const imageDataResponse = await axios.get(`https://api.thecatapi.com/v1/images/${breed.reference_image_id}`);
      const imageData = imageDataResponse.data;
      console.log(`Breed ${breed.name} image data:`, imageData);
      return { ...breed, imageData };
    });
    const breedData = await Promise.all(breedDataPromises);
    console.log('Breed data with image data:', breedData);

    if (breedData.length > 0) {
      res.status(200).json(breedData);
    } else {
      res.status(404).send(`Breed ${breedName} not found`);
    }
        // if (filteredBreeds.length > 0) {
        //   res.status(200).json(filteredBreeds);
        // } else {
        //   res.status(404).send(`Breed ${breedName} not found`);
        // }
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





// Endpoint to show all breeds detail
// app.get('/api/all-breeds', async (req, res) => {
//   try {
//     const response = await axios.get(`${allBreedsUrl}`);
//     const imageData = response.data;

//     // convert image data to Base64 encoding
//     const base64Image = Buffer.from(imageData, 'binary').toString('base64');
//     const dataURI = `data:image/jpeg;base64,${base64Image}`;

//     res.send(dataURI);
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching all breeds' });
//   }
// });



app.listen(port, () => {
  console.log(`server has online and listening on port ${port}`);
});