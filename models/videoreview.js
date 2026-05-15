'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VideoReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VideoReview.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    user_name: DataTypes.STRING,
    user_handle: DataTypes.STRING,
    user_avatar: DataTypes.STRING,
    location: DataTypes.STRING,
    video_url: DataTypes.STRING,
    likes_count: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    package_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'VideoReview',
  });
  return VideoReview;
};