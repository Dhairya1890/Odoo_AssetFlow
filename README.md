## Server Setup

mkdir server && cd server
npm init -y

npm install express sequelize mysql2 bcryptjs jsonwebtoken dotenv cors helmet express-validator multer socket.io node-cron qrcode exceljs json2csv uuid

npm install --save-dev nodemon sequelize-cli

npx sequelize-cli init

mkdir -p src/{config,models,routes,controllers,middleware,services,jobs,utils}
mkdir -p uploads

## Client Setup

npm create vite@latest client -- --template react
cd client
npm install

npm install axios react-router-dom @tanstack/react-query zustand socket.io-client recharts react-big-calendar moment date-fns react-hook-form @hookform/resolvers zod react-hot-toast lucide-react clsx tailwind-merge

npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p

mkdir -p src/{api,hooks,store,utils}
mkdir -p src/components/{ui,layout,shared}
mkdir -p src/pages/{Auth,Dashboard,OrgSetup,Assets,Allocations,Bookings,Maintenance,Audits,Reports,Notifications}

cd ..