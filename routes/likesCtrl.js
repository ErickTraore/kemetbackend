// Imports
var models = require('../models');
var jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes
module.exports = {
    likePost: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var messageId = parseInt(req.params.messageId);
        console.log('message.id', messageId);

        if (messageId <= 0) {
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
                            done(null, userLive);
                        })
                        .catch(function(error) {
                            return res.status(500).json({ 'error': 'unable to load user' });
                        });
                },
                function(userLive, done) {
                    if (userLive) {

                        models.Message.findOne({
                                where: {
                                    id: messageId
                                }
                            })
                            .then(function(messageLive) {
                                // return res.status(200).json({ userLive });
                                done(null, messageLive);

                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to load message' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'utilisateur inconnu' });
                    }
                },
                function(messageLive, done) {
                    if (messageLive) {
                        models.Like.findOne({
                                where: {
                                    messageId: messageId,
                                    userId: userId
                                }
                            })
                            .then(function(likeLive) {
                                // return res.status(200).json({ likeLive });
                                done(null, likeLive, messageLive)
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to load like' });
                            });

                    } else {
                        res.status(404).json({ 'error': 'message inconnu' });
                    }
                },

                function(likeLive, messageLive, done) {
                    if (likeLive) {
                        if (messageLive.dislikes > 0 && !likeLive.isLike) {
                            console.log("messagelive > 0")
                            messageLive.update({
                                dislikes: messageLive.dislikes - 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.dislikes = 0 && !likeLive.isLike) {
                            messageLive.update({
                                dislikes: messageLive.dislike * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.dislikes < 0 && !likeLive.isLike) {
                            messageLive.update({
                                dislikes: messageLive.dislike * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes > 0 && likeLive.isLike) {
                            console.log("messagelive = 0")
                            messageLive.update({
                                likes: messageLive.likes - 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes = 0 && likeLive.isLike) {

                            console.log("messagelive < 0")
                            messageLive.update({
                                dislikes: messageLive.dislikes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes < 0 && likeLive.isLike) {
                            // if (!likeLive) {
                            console.log("messagelive choix 3")
                            messageLive.update({
                                dislikes: messageLive.dislikes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: LIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        };
                    } else {
                        if (messageLive.likes >= 0) {
                            console.log("messagelive choix 3")
                            messageLive.update({
                                likes: messageLive.likes + 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: LIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        } else {
                            console.log("messagelive choix 3")
                            messageLive.update({
                                likes: messageLive.likes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: LIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        }

                    }
                },


            ],
            function(newLike) {
                if (newLike) {
                    return res.status(201).json(newLike);
                } else {
                    return res.status(500).json({ 'error': 'cannot create newLike' });
                }
            });

    },

    dislikePost: function(req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log('Utilisateur', userId);
        console.log(headerAuth);

        // Params
        var messageId = parseInt(req.params.messageId);
        console.log('message.id', messageId);

        if (messageId <= 0) {
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
                            done(null, userLive);
                        })
                        .catch(function(error) {
                            return res.status(500).json({ 'error': 'unable to load user' });
                        });
                },
                function(userLive, done) {
                    if (userLive) {

                        models.Message.findOne({
                                where: {
                                    id: messageId
                                }
                            })
                            .then(function(messageLive) {
                                // return res.status(200).json({ userLive });
                                done(null, messageLive);

                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to load message' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'utilisateur inconnu' });
                    }
                },
                function(messageLive, done) {
                    if (messageLive) {
                        models.Like.findOne({
                                where: {
                                    messageId: messageId,
                                    userId: userId
                                }
                            })
                            .then(function(likeLive) {
                                // return res.status(200).json({ likeLive });
                                done(null, likeLive, messageLive)
                            })
                            .catch(function(error) {
                                return res.status(502).json({ 'error': 'unable to load like' });
                            });

                    } else {
                        res.status(404).json({ 'error': 'message inconnu' });
                    }
                },

                function(likeLive, messageLive, done) {
                    if (likeLive) {
                        if (messageLive.dislikes > 0 && !likeLive.isLike) {
                            console.log("messagelive > 0")
                            messageLive.update({
                                dislikes: messageLive.dislikes - 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.dislikes = 0 && !likeLive.isLike) {
                            messageLive.update({
                                dislikes: messageLive.dislike * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.dislikes < 0 && !likeLive.isLike) {
                            messageLive.update({
                                dislikes: messageLive.dislike * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes > 0 && likeLive.isLike) {
                            console.log("messagelive = 0")
                            messageLive.update({
                                likes: messageLive.likes - 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes = 0 && likeLive.isLike) {

                            console.log("messagelive < 0")
                            messageLive.update({
                                dislikes: messageLive.dislikes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(destroy)' });
                            });
                            models.Like.destroy({
                                    where: {
                                        messageId: messageId,
                                        userId: userId
                                    }
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ deleteLikeLive });
                                    done(newLike)
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to delete like' });
                                });
                        } else
                        if (messageLive.likes < 0 && likeLive.isLike) {
                            // if (!likeLive) {
                            messageLive.update({
                                dislikes: messageLive.dislikes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: LIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        };
                    } else {
                        if (messageLive.dislikes >= 0) {
                            console.log("messagelive choix 3")
                            messageLive.update({
                                dislikes: messageLive.dislikes + 1,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: DISLIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        } else {
                            messageLive.update({
                                dislikes: messageLive.dislikes * 0,
                            }).then(function() {
                                done(messageLive);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot update message like counter(create)' });
                            });
                            const newLike = models.Like.create({
                                    messageId: messageId,
                                    userId: userId,
                                    isLike: DISLIKED,
                                })
                                .then(function(newLike) {
                                    // return res.status(200).json({ newLike });
                                    done(newLike);
                                })
                                .catch(function(error) {
                                    return res.status(502).json({ 'error': 'unable to create newLike' });

                                });
                            // }
                        }

                    }
                },


            ],
            function(newLike) {
                if (newLike) {
                    return res.status(201).json(newLike);
                } else {
                    return res.status(500).json({ 'error': 'cannot create newLike' });
                }
            });

    },
}