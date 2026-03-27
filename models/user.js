const { DataTypes } = require("sequelize");
const { createPasswordDigest, verifyPassword } = require("../services/password");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      role: {
        type: DataTypes.ENUM("worker", "admin"),
        allowNull: false,
        defaultValue: "worker"
      },
      login: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      passwordSalt: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      telegramId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      chatId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      language: {
        type: DataTypes.ENUM("uz", "ru", "uz-cyrl"),
        allowNull: false,
        defaultValue: "uz"
      },
      isRegistered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      balance: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "users",
      underscored: true,
      hooks: {
        beforeValidate(user) {
          if (user.login) {
            user.login = String(user.login).trim().toLowerCase();
          }
        }
      }
    }
  );

  User.prototype.setPassword = function setPassword(password) {
    const digest = createPasswordDigest(password);
    this.passwordSalt = digest.salt;
    this.passwordHash = digest.hash;
  };

  User.prototype.verifyPassword = function verifyUserPassword(password) {
    return verifyPassword(password, this.passwordSalt, this.passwordHash);
  };

  return User;
};
