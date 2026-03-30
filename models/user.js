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
      adminChatId: {
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
      enteredFirstName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      enteredLastName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      withdrawalCardNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      language: {
        type: DataTypes.ENUM("uz", "ru"),
        allowNull: false,
        defaultValue: "uz"
      },
      languageSelected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isRegistered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      registrationStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "awaiting_phone"
      },
      registrationReviewedByAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      registrationPhotoFileId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      registrationPhotoUniqueFileId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      registrationPhotoData: {
        type: DataTypes.BLOB,
        allowNull: true
      },
      registrationPhotoMimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      registrationPhotoName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      registrationPhotoSubmittedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
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
