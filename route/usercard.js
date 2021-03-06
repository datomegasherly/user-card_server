const express = require('express');
const router = express.Router();

const DB = require('magic-mongodb');
const db = DB({dbName: 'usercard', collections: ['userlist']});

const Joi = require('joi');
const schema = Joi.object({
    _id: Joi.string().optional().allow('', null),
    id: Joi.number().optional().allow('', null).greater(-1).max(10).required(),
    username: Joi.string().min(3).max(40).pattern(new RegExp('^[a-zA-Z0-9]{3,40}$')).required(),
    name: Joi.string().min(3).max(40).pattern(new RegExp('^[a-zA-Z ]{3,40}$')).required(),
    phone: Joi.string().optional().allow('', null).min(3).max(45).pattern(new RegExp('^[0-9+\-]{5,45}$')),
    website: Joi.string().optional().allow('', null).min(5).max(60).pattern(new RegExp('^(http:\\|https:\\|)(www.|)[a-zA-Z0-9\-_\.]{5,40}\.[a-zA-Z]{2,5}$')),
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

const createData = (userData, res) => {
    db.getData('userlist', {query: {username: userData.username}});
    db.response((data) => {
        if(!data.length){
            db.createData('userlist', userData);
            db.response((data) => {
                res.send({data, success: true});
            });
        } else {
            res.send({error: 'User exist'});
        }
    });
}

router.post('/', (req, res) => {
    let userData = req.body;
    const { error, value } = schema.validate(userData);
    if(error){
        res.send({error: error.details[0].message});
    } else {
        createData(userData, res);
    }
});

const editData = (userData, res) => {
    let query = {query: {_id: userData._id}};
    db.getData('userlist', query);
    db.response((data) => {
        if(data.length){
            delete(userData._id);
            delete(userData.id);
            db.updateData('userlist', userData, query);
            db.response((data) => {
                res.send({data, success: true});
            });
        } else {
            res.send({error: 'User is not exist'});
        }
    });
}

router.put('/:id', (req, res) => {
    let userData = req.body;
    let id = req.params.id;
    userData._id = id;
    const { error, value } = schema.validate(userData);
    if(error){
        res.send({error: error.details[0].message});
    } else {
        editData(userData, res);
    }
});

const deleteData = (id, res) => {
    let query = {query: {_id: id}};
    db.getData('userlist', query);
    db.response((data) => {
        if(data.length){
            db.deleteData('userlist', query);
            db.response((data) => {
                res.send({data, success: true});
            });
        } else {
            res.send({error: 'Id is not exist'});
        }
    });
}

router.delete('/:id', (req, res) => {
    let id = req.params.id;
    if(!id){
        res.send({error: 'Id is not exist'});
    } else {
        deleteData(id, res);
    }
});

module.exports = router;