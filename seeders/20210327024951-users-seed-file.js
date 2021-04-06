'use strict';

const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      name: 'root',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: 'user2',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
