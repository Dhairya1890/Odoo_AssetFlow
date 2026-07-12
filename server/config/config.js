require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

    password: process.env.DB_PASSWORD || 'AssetFlow@123',
    database: (process.env.DB_NAME || 'assetflow') + '_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  },
};
