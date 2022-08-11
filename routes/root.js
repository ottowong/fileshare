const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const Blob = require('node-blob');
const path = require('path');
require('dotenv').config()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_S3_ENDPOINT
})

const express = require('express');
const controllerConfig = require('../config/controller/config')
const db = require('../database/config');

const router = express.Router();

async function uploadStuff(file,fileName) {
  console.log("uplooad");
    const uploadedImage = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      // Key: req.files[0].originalFilename,
      Key: fileName,
      Body: file.data,
      ACL: 'public-read',
      ContentType: file.mimetype
    }).promise()
}


router.post('/', async function(req, res){
  if (req.files) {
    var urls = [];
    let controllerData = controllerConfig.merge({
      header: {
        title: "Files"
      },
      file: 'filebox.ejs'
    })
    // console.log(req.files)

    if(req.files.file[0]){ // multiple file upload
      
      req.files.file.forEach(file => {
        // console.log(file);

        const fileName = path.parse(file.name).name + "_" + Date.now() + path.parse(file.name).ext;
        uploadStuff(file,fileName);
      
        urls.push(process.env.CDN_URL + "/" + fileName)
        // res.render('application.ejs', controllerData)
      })

      
      console.log(urls);
      controllerData.urls = urls;
      res.render('application.ejs', controllerData)
    } 

    else // single file upload

    {
      const file = req.files.file
      const fileName =  path.parse(file.name).name + "_" + Date.now() + path.parse(file.name).ext;
      const uploadedImage = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        // Key: req.files[0].originalFilename,
        Key: fileName,
        Body: file.data,
        ACL: 'public-read',
        ContentType: file.mimetype
      }).promise()
      
      controllerData.urls = [process.env.CDN_URL + "/" + fileName]
      res.render('application.ejs', controllerData)
    }

    



  } else {
    res.send('There are no files')
  }

  
  // const imageURL = 'https://media.gleasonator.com/0c760b3ecdbc993ba47b785d0adecf0ec71fd9c59808e27d0665b9f77a32d8de.png'
  // const res = await fetch(imageURL)
  // const blob = await res.buffer()
  
});

router.get('/', function(req, res) {


  let controllerData = controllerConfig.merge({
    header: {
      title: "SADLADS FILESHARE"
    },
    file: 'index.ejs'
  })

  db.serialize(function() {
    db.all('SELECT * FROM lorem', function(err, rows) {
      if (err) {
        console.log(err)
      } else {
        controllerData.rows = rows
        res.render('application.ejs', controllerData)
      }
    })
  })
});

module.exports = router
