// Imports
const fs = require('fs')
var models = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');
const usersCtrl = require('./usersCtrl');

const fileUpload = require("express-fileupload");
const path = require("path");
const util = require('util');

// httpServer.listen(8080);
// Constants
const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 3;
const ITEMS_LIMIT = 50;

// Routes
module.exports = {
    createFormation: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Params
        var titleFirst = req.body.titleFirst;
        var titleSecond = req.body.titleSecond;
        var duration = req.body.duration;
        var niveau = req.body.niveau;
        var isActive = req.body.isActive;
        var attachment = req.body.attachment;
        if (attachment == null || titleFirst == null || titleSecond == null || niveau == null) {
            return res.status(400).json({ 'error': 'missing (null) parameters' });
        }

        if (titleFirst.length <= TITLE_LIMIT || titleSecond.length <= TITLE_LIMIT || attachment.length <= TITLE_LIMIT || duration.length <= TITLE_LIMIT || isActive.length <= TITLE_LIMIT) {
            return res.status(400).json({ 'error': 'invalid (length) parameters' });
        }


        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        where: { id: userId }
                    })
                    .then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Formation.create({
                            titleFirst: titleFirst,
                            titleSecond: titleSecond,
                            attachment: attachment || null,
                            niveau: niveau,
                            duration: duration,
                            isActive: isActive,
                            UserId: userFound.id
                        })
                        .then(function(newFormation) {
                            done(newFormation);
                        });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ], function(newFormation) {
            if (newFormation) {
                return res.status(201).json(newFormation);
            } else {
                return res.status(500).json({ 'error': 'cannot post Formation' });
            }
        });
    },
    listFormations: function(req, res) {
        console.log('voici le reqField');

        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        }

        models.Formation.findAll({
            order: [(order != null) ? order.split(':') : ['titleFirst', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,

            order: [
                ['id', 'DESC']
            ],
        }).then(function(formations) {
            if (formations) {
                res.status(200).json(formations);
            } else {
                res.status(404).json({ "error": "no Formations found" });
            }
        }).catch(function(err) {
            res.status(500).json({ "error": "invalid fields formations" });
        });
    },
    listFormationsAdmin: function(req, res) {
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;
        console.log(req)
        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        }

        models.Formation.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.User,
                attributes: ['username', 'email']
            }],
            order: [
                ['id', 'DESC']
            ],
        }).then(function(Formations) {
            if (Formations) {
                res.status(200).json(Formations);
            } else {
                res.status(404).json({ "error": "no Formations found" });
            }
        }).catch(function(err) {
            res.status(500).json({ "error": "invalid fields" });
        });
    },
    delMessPost: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        var recepteur = userId
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var FormationId = parseInt(req.params.FormationId);
        console.log('Formation.id', FormationId);

        if (FormationId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
                // on charge le Formation concerné dans la variable FormationFound..
                function(done) {
                    models.User.findOne({
                            where: {
                                id: userId
                            }
                        })
                        .then(function(userLive) {
                            done(null, userLive);
                        })
                        .catch(function(error) {
                            return res.status(500).json({ 'error': 'unable to load user' });
                        });
                },
                function(userLive, done) {
                    if (userLive) {

                        models.Formation.findOne({
                                where: {
                                    id: FormationId,
                                }
                            })
                            .then(function(FormationLive) {
                                done(null, FormationLive, userLive);
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'is not the owner Formation' });
                            });
                    } else {
                        return res.status(201).json({ 'error': 'You are not the owner Formation' });
                    }

                },
                function(FormationLive, userLive, done) {
                    console.log('FormationLive.UserId :', FormationLive)
                    console.log('userId', userId)
                    console.log('FormationLive.UserId :', FormationLive.UserId)
                    console.log('FormationLive.Likes :', FormationLive.likes)
                    console.log('FormationLive.Dislikes :', FormationLive.dislikes)
                    console.log('FormationLive.id :', FormationId)
                    if (FormationLive.UserId = userId) {
                        FormationLive.update({
                            likes: FormationLive.likes * 0,
                            dislikes: FormationLive.dislike * 0,
                        }).then(function() {
                            done(FormationLive);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update likes=0 and dislike=0' });
                        });
                        models.Like.destroy({
                                where: {
                                    FormationId: FormationId,
                                }
                            })
                            .then(function(newLike) {
                                // return res.status(200).json({ deleteLikeLive });
                                done(newLike)
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to delete like' });
                            });
                        models.Formation.destroy({
                                where: {
                                    id: FormationId,
                                }
                            })
                            .then(function(destroyFormation) {
                                // return res.status(200).json({ deleteLikeLive });
                                done(destroyFormation)
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to delete like' });
                            });


                    } else {
                        res.status(404).json({ 'error': 'unable to load Formation found' });
                    }
                },
            ],
            function(destroyFormation) {
                if (!destroyFormation) {
                    return res.status(201).json('Formation delete');
                } else {
                    return res.status(500).json({ 'error': 'cannot delete Formation' });
                }
            }

        );
    },
    delMessPostAdmin: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var FormationId = parseInt(req.params.FormationId);
        console.log('Formation.id', FormationId);

        if (FormationId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
                // on charge le Formation concerné dans la variable FormationFound..
                function(done) {
                    models.User.findOne({
                            where: {
                                id: userId
                            }
                        })
                        .then(function(userLive) {
                            done(null, userLive);
                        })
                        .catch(function(error) {
                            return res.status(500).json({ 'error': 'unable to load user' });
                        });
                },
                function(userLive, done) {
                    if (userLive) {

                        models.Formation.findOne({
                                where: {
                                    id: FormationId,
                                }
                            })
                            .then(function(FormationLive) {
                                done(null, FormationLive, userLive);
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'is not the owner Formation' });
                            });
                    } else {
                        return res.status(201).json({ 'error': 'You are not the owner Formation' });
                    }

                },
                function(FormationLive, userLive, done) {
                    if (FormationLive) {
                        models.Formation.destroy({
                                where: {
                                    id: FormationId,
                                }
                            })
                            .then(function(destroyFormation) {
                                // return res.status(200).json({ deleteLikeLive });
                                done(destroyFormation)
                            })
                            .catch(function(error) {
                                return res.status(404).json({ 'error': 'unable to destroy Formation' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'unable to load Formation found' });
                    }
                },
            ],
            function(destroyFormation) {
                if (destroyFormation) {
                    return res.status(201).json('Formation delete');
                } else {
                    return res.status(500).json({ 'error': 'cannot delete Formation' });
                }
            }

        );
    },
    uploadImage: async function(req, res) {
        // return Promise.resolve('traore erick');
        // console.log(req);
        // console.log(JSON.stringify(req).files)
        var file = req.files.file;
        var fileName = file.name;
        console.log('UN YANKEE UPLOAD');
        console.log('fileName ligne 337:', fileName);
        var size = file.data.length;
        var extension = path.extname(fileName);

        var allowedExtensions = /png|jpeg|jpg|gif/;
        const md5 = file.md5;
        const URL = "/formations/images/" + md5 + extension;
        const idImage = md5 + extension;
        console.log('numero image enregistrée ligne 195:', idImage);


        try {
            if (!allowedExtensions.test(extension)) throw "unsupported extension!";
            if (size > 5000000) throw "File must be less than 5 MB";

            await util.promisify(file.mv)("./public" + URL);
            res.status(200).json({
                idImage,
            })

        } catch (err) {
            console.log(err);
            res.status(500).json({
                Formation: err,
            });
        };

    },
    delLienImage: function(req, res) {
        var file = req.files.file;
        var fileName = file.name;
        console.log('UN YANKEE');
        console.log('fileName ligne 187:', fileName);
        var size = file.data.length;
        var extension = path.extname(fileName);

        var allowedExtensions = /png|jpeg|jpg|gif/;
        const md5 = file.md5;
        const URL = "/images/" + md5 + extension;
        const idImage = md5 + extension;
        console.log(URL);
        console.log(idImage);
        const chemin = idImage;
        console.log('chemin', chemin);
        fs.unlink("./public/images/" + idImage, (err) => {
            if (err) {
                console.error(err)
                return
            }


        });
    }
}