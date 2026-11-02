const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  nickName: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, len: [2, 40] },
  },
}, { tableName: "Users" });

const Post = sequelize.define("Post", {
  description: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "Posts" });

const PostImage = sequelize.define("PostImage", {
  url: { type: DataTypes.STRING(2048), allowNull: false },
  postId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "Post_Images" });

const maxAgeMonths = Number(process.env.COMMENT_MAX_AGE_MONTHS || 6);
const Comment = sequelize.define("Comment", {
  message: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
  postId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  isVisible: {
    type: DataTypes.VIRTUAL,
    get() {
      const createdAt = this.getDataValue("createdAt");
      if (!createdAt) return false;
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - maxAgeMonths);
      return new Date(createdAt) >= cutoff;
    },
  },
}, { tableName: "Comments" });

const Tag = sequelize.define("Tag", {
  name: { type: DataTypes.STRING(40), allowNull: false, unique: true, validate: { notEmpty: true } },
}, { tableName: "Tags" });

const Follow = sequelize.define("Follow", {
  followerId: { type: DataTypes.INTEGER, allowNull: false },
  followedId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "Follows",
  indexes: [{ unique: true, fields: ["followerId", "followedId"] }],
});

User.hasMany(Post, { as: "posts", foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { as: "author", foreignKey: "userId" });
Post.hasMany(PostImage, { as: "images", foreignKey: "postId", onDelete: "CASCADE" });
PostImage.belongsTo(Post, { as: "post", foreignKey: "postId" });
Post.hasMany(Comment, { as: "comments", foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(Post, { as: "post", foreignKey: "postId" });
User.hasMany(Comment, { as: "comments", foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { as: "author", foreignKey: "userId" });
Post.belongsToMany(Tag, { as: "tags", through: "Post_Tags", foreignKey: "postId", otherKey: "tagId" });
Tag.belongsToMany(Post, { as: "posts", through: "Post_Tags", foreignKey: "tagId", otherKey: "postId" });
User.belongsToMany(User, { as: "following", through: Follow, foreignKey: "followerId", otherKey: "followedId" });
User.belongsToMany(User, { as: "followers", through: Follow, foreignKey: "followedId", otherKey: "followerId" });

module.exports = { sequelize, User, Post, PostImage, Comment, Tag, Follow };
