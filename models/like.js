'use strict';
module.exports = (sequelize, DataTypes) => {
  var Like = sequelize.define('Like', {
    messageId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Message',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    isLike: DataTypes.INTEGER
  }, {});
  Like.associate = function (models) {
    models.Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    models.Like.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message',
    });
  };
  return Like;
};