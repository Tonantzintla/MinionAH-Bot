from oven/bun

workdir /app

copy . .

run bun i

run bunx prisma generate

cmd ["bun", "run", "prod"]
