// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;
const ITEMS_LIMIT = 50;


const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;





module.exports = {
    register: function(req, res) {

        // Params
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;

        if (email == null) {
            return res.status(400).json({ 'error': 'email missing parameters' });
        }
        if (username == null) {
            return res.status(400).json({ 'error': 'username missing parameters' });
        }
        if (password == null) {
            return res.status(400).json({ 'error': 'password missing parameters' });
        }
        if (username.length >= 13 || username.length <= 3) {
            return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid' });
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        attributes: ['email'],
                        where: { email: email }
                    })
                    .then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json({ 'error': 'user already exist' });
                }
            },
            function(userFound, bcryptedPassword, done) {
                var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                    .then(function(newUser) {
                        done(newUser);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'cannot add user' });
                    });
            }
        ], function(newUser) {
            if (newUser) {
                const $token = jwtUtils.generateTokenForUser(newUser);
                return res.status(201).json({
                    '$userId': newUser.id,
                    $token,
                });
            } else {
                return res.status(500).json({ 'error': 'cannot add user' });
            }
        });
    },
    login: function(req, res, next) {

        // Params
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        where: { email: email }
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
                    bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                        done(null, userFound, resBycrypt);
                    });
                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB' });
                }
            },
            function(userFound, resBycrypt, done) {
                if (resBycrypt) {
                    done(userFound);
                } else {
                    return res.status(403).json({ 'error': 'invalid password' });
                }
            }
        ], function(userFound) {
            if (userFound) {
                $userId = userFound.id;
                $token = jwtUtils.generateTokenForUser(userFound);
                return res.status(201).json({
                    $userId,
                    $token
                });
            } else {
                return res.status(500).json({ 'error': 'cannot log on user' });
            }
        });
        next;

    },

    getUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            var testUser = 'testOk'
            return res.status(201).json({ testUser });
        } else {
            models.User.findOne({
                attributes: ['id', 'email', 'username', 'bio', 'isAdmin'],
                where: { id: userId }
            }).then(function(user) {
                if (user) {
                    res.status(201).json(user);
                } else {
                    res.status(405).json({ 'error': 'user not found' });
                }
            }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot fetch user' });
            });
        }
    },
    updateUserProfile: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Params
        var bio = req.body.bio;
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        attributes: ['id', 'bio'],
                        where: { id: userId }
                    }).then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if (userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio)
                    }).then(function() {
                        done(userFound);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update user' });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        });
    },
    listUsers: function(req, res) {
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        }

        models.User.findAll({
                order: [(order != null) ? order.split(':') : ['username', 'ASC']],
                attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                limit: (!isNaN(limit)) ? limit : null,
                offset: (!isNaN(offset)) ? offset : null,
                order: [
                    ['id', 'DESC']
                ],
            })
            .then(function(users) {
                if (users) {
                    res.status(200).json(users);
                } else {
                    res.status(404).json({ "error": "no users found" });
                }
            }).catch(function(err) {
                res.status(500).json({ "error": "invalid fields" });
            });
    },
    destroyUser: function(req, res) {
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        var destroyId = -1;
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var destroyId = parseInt(req.params.userId);
        console.log('destroyId', destroyId);

        if (destroyId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        models.Like.destroy({
            where: {
                userId: destroyId
            }
        }).then(count => {
            if (!count) {
                res.status(204).send();
            }
            res.status(204).send();
        });
        models.Message.destroy({
            where: {
                userId: destroyId
            }
        }).then(count => {
            if (!count) {
                res.status(204).send();
            }
            res.status(204).send();
        });
        models.User.destroy({
            where: {
                id: destroyId
            }
        }).then(count => {
            if (!count) {
                res.status(204).send();
            }
            res.status(204).send();
        });

    },

    destroyProfil: function(req, res) {
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        if (userId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
                // on charge le message concerné dans la variable messageFound..
                function(done) {
                    models.User.findOne({
                            where: {
                                id: userId
                            }
                        })
                        .then(function(userLive) {
                            done(userLive);
                        })
                        .catch(function(error) {
                            return res.status(500).json({ 'error': 'unable to load user' });
                        });
                },
            ],
            function(userLive, done) {
                if (userLive) {
                    models.Message.destroy({
                            where: {
                                id: messageId,
                            }
                        })
                        .then(function() {
                            done(delMessage);
                        })
                        .catch(function(err) {
                            return res.status(404).json({ 'error': 'unable to destroy message' });
                        });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        )
    }
}