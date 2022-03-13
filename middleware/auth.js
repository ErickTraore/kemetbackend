const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // nous extrayons le token du header Authorization de la requête entrante.
        const token = req.headers.authorization.split(' ')[1];
        // nous utilisons ensuite la fonction verify pour décoder notre token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        // nous extrayons l'ID utilisateur de notre token 
        const userId = decodedToken.userId;
        // si la demande contient un ID utilisateur, nous le comparons à celui extrait du token
        // s'il sont différents nous générerons une erreur
        if (req.body.userId && req.body.userId !== userId) {
            return res.status(403).json({ error: 'Utilisateur non trouvé !' });
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: 'Invalid request!'
        });
    }
};