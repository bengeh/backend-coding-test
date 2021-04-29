'use strict';
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const winston = require('winston')
const logConfiguration = require('./logger');
const { json } = require('body-parser');

const logger = winston.createLogger(logConfiguration);

async function query(sql, params) {
    const connection = await mysql.createConnection(config.db);
    const [results, ] = await connection.execute(sql, params);
  
    return results;
  }
  
module.exports = (db) => {
    app.get('/health', async (req, res) => {
        try {
            return res.json({'status': 'healthy'})
        } catch (err) {
            return res.send({
                error_code: err,
                message: 'Service down'
            });
        }
    });

    app.post('/rides', jsonParser, async (req, res) => {
        logger.warn("Hello, Winston logger, the first warning!");
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        try {
            let result = await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values)
            return res.json(result)
        } catch (err) {
            return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    
    app.get('/rides', async (req, res) => {
        try {
            let rides = await db.all('SELECT * FROM Rides')
            return res.json(rides)
        } catch (err) {
            return res.send({
                error_code: err,
                message: 'Could not find any rides'
            });
        }
    })

    app.get('/rides/:id', async (req, res) => {
        //santizing input, assume id is purely number (security improvement)
        if(/^\d+$/.test(req.params.id)){
            try{
                let singleRide = await db.all(`SELECT * FROM Rides WHERE rideID=?`, [req.params.id])
                return res.json(singleRide)
            } catch(err) {
                return res.send({
                    error_code: 'Service error',
                    message: 'Service error'
                });
            }
        }else {
            return res.send({
                error_code: 'INPUT_ERROR',
                message: 'Input error'
            });
        }
    });

    return app;
};
