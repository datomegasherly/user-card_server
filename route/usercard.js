const express = require('express');
const router = express.Router();

const DB = require('magic-mongodb');
const db = DB({dbName: 'usercard', collections: ['userlist']});

const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string().min(3).max(40).pattern(new RegExp('^[a-zA-Z0-9]{3,40}$')).required(),
    name: Joi.string().min(3).max(40).pattern(new RegExp('^[a-zA-Z ]{3,40}$')).required(),
    phone: Joi.string().min(5).max(45).pattern(new RegExp('^[0-9+\-]{5,45}$')),
    website: Joi.string().min(5).max(60).pattern(new RegExp('^(http:\\|https:\\|)(www.|)[a-zA-Z0-9\-_\.]{5,40}\.[a-zA-Z]{2,5}$')),
    email: Joi.string().min(5).max(60).pattern(new RegExp('^[a-zA-Z0-9\-_\.]{2,40}@[a-zA-Z0-9\-_\.]{2,40}\.[a-zA-Z]{2,5}$')).required(),
    address: Joi.object({
       city: Joi.string().min(3).max(60).pattern(new RegExp('^[a-zA-Z ]{3,60}$')).required(),
       street: Joi.string().min(3).max(60).pattern(new RegExp('^[a-zA-Z0-9\-_. ]{3,90}$')).required(),
       suite: Joi.string().min(1).max(30).pattern(new RegExp('^[a-zA-Z0-9\-_. ]{1,30}$')),
       zipcode: Joi.string().min(2).max(10).pattern(new RegExp('^[0-9\-]{2,10}$'))
    }),
});

router.get('/', (req, res) => {
    db.getData('userlist');
    db.response((data) => {
        data ? res.send(data) : res.status(404).send('error in fetch data');
    });
});

router.post('/', (req, res) => {
    let userData = req.body;
    const { error, value } = schema.validate(userData);
    if(error){
        res.send({error: error.details[0].message});
    }
});

module.exports = router;