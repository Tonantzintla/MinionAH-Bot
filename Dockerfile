from oven/bun

workdir /app

copy package.json .

run bun i

copy . .

run bunx prisma generate

cmd ["bun", "run", "prod"]