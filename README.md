# Movie Recommendation System

คู่มือใช้งานเพิ่มเติม: [USER_GUIDE.md](USER_GUIDE.md)

ระบบแนะนำภาพยนตร์โดยใช้ Neo4j Graph Database สำหรับเก็บข้อมูลผู้ใช้ ภาพยนตร์ และความสัมพันธ์ เช่น `WATCHED` กับ `LIKED` จากนั้นนำข้อมูลใน graph ไปใช้คำนวณคำแนะนำภาพยนตร์ผ่านเว็บแอป

## Features

- สมัครสมาชิกและเข้าสู่ระบบ
- บัญชี admin เริ่มต้นสำหรับทดลองใช้งาน
- จัดการข้อมูลผู้ใช้
- จัดการข้อมูลภาพยนตร์
- เพิ่ม แก้ไข และลบความสัมพันธ์ระหว่างผู้ใช้กับภาพยนตร์
- แนะนำภาพยนตร์หลายรูปแบบ ได้แก่ Personalized, Collaborative, Genre-based และ Popular
- มี endpoint สำหรับเพิ่มข้อมูลตัวอย่างเพื่อทดลองระบบ
- รองรับการรันด้วย Docker Compose พร้อม Neo4j

## Tech Stack

- Node.js
- Express
- Neo4j
- neo4j-driver
- HTML, CSS, JavaScript
- Docker และ Docker Compose

## Project Structure

```text
.
|-- server.js              # Express API และ logic เชื่อมต่อ Neo4j
|-- index.html             # หน้า Home หลังเข้าสู่ระบบ
|-- login.html             # หน้าเข้าสู่ระบบ
|-- signup.html            # หน้าสมัครสมาชิก
|-- users.html             # หน้าจัดการผู้ใช้
|-- movies.html            # หน้าจัดการภาพยนตร์และ relationship
|-- recommend.html         # หน้าแนะนำภาพยนตร์
|-- admin.html             # หน้า admin dashboard
|-- css/                   # stylesheet
|-- js/                    # frontend JavaScript
|-- Dockerfile             # image สำหรับ Node.js app
|-- docker-compose.yml     # app + Neo4j
|-- package.json
`-- .env.example
```

## Prerequisites

- Node.js 18 หรือใหม่กว่า
- npm
- Neo4j 5.x หรือ Docker Desktop

## Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env`

```bash
copy .env.example .env
```

ตัวอย่างค่าใน `.env`

```env
PORT=4000
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=12345678
NEO4J_DATABASE=neo4j
```

ตัวแปรเสริมที่ server รองรับ:

```env
DEFAULT_ADMIN_NAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

ถ้าไม่ได้กำหนดค่า admin ระบบจะใช้ `admin` / `admin123` เป็นค่าเริ่มต้น

## Installation

ติดตั้ง dependencies

```bash
npm install
```

## Run Locally

ตรวจสอบว่า Neo4j เปิดอยู่และใช้ credential ตรงกับ `.env` จากนั้นรัน server

```bash
npm start
```

หรือ

```bash
npm run dev
```

เปิดเว็บแอปที่:

```text
http://localhost:4000/login.html
```

ตรวจสอบ API health check:

```text
http://localhost:4000/api/health
```

## Run With Docker Compose

ใช้คำสั่งนี้เพื่อรันทั้ง Node.js app และ Neo4j

```bash
docker compose up -d --build
```

หลังจาก container ทำงานแล้ว เปิดใช้งานได้ที่:

```text
App:           http://localhost:4000/login.html
Neo4j Browser: http://localhost:7474
```

หยุด container:

```bash
docker compose down
```

หยุดและลบ volume ฐานข้อมูล:

```bash
docker compose down -v
```

## Default Login

```text
Username: admin
Password: admin123
```

หากแก้ `DEFAULT_ADMIN_NAME` หรือ `DEFAULT_ADMIN_PASSWORD` ใน `.env` ให้ใช้ค่าที่ตั้งไว้แทน

## Main Pages

- `login.html` - เข้าสู่ระบบ
- `signup.html` - สมัครสมาชิก
- `index.html` - หน้า Home สำหรับเลือกหนังที่ดูแล้วหรือชอบ
- `users.html` - จัดการผู้ใช้
- `movies.html` - จัดการภาพยนตร์และ relationship
- `recommend.html` - ดูผลแนะนำภาพยนตร์
- `admin.html` - dashboard สำหรับ admin

## Recommendation Modes

- `personalized` - แนะนำจากหนังที่ผู้ใช้เคย `WATCHED` หรือ `LIKED`
- `collaborative` - แนะนำจากผู้ใช้คนอื่นที่มีพฤติกรรมคล้ายกัน
- `genre` - แนะนำจาก genre ของหนังที่ผู้ใช้ชอบ
- `popular` - แนะนำจากความนิยมรวมของระบบ

## API Endpoints

### System

```text
GET /api/health
GET /api/stats
```

### Auth

```text
POST /api/auth/register
POST /api/auth/login
```

### Users

```text
GET    /api/users
GET    /api/users/names
POST   /api/users
PUT    /api/users/:name
DELETE /api/users/:name
DELETE /api/users
POST   /api/users/sample
GET    /api/users/:name/profile
```

### Movies

```text
GET    /api/movies
GET    /api/movies/titles
POST   /api/movies
PUT    /api/movies/:title
DELETE /api/movies/:title
DELETE /api/movies
POST   /api/movies/sample
```

### Relationships

```text
GET    /api/relationships
POST   /api/relationships
PUT    /api/relationships
DELETE /api/relationships
POST   /api/relationships/sample
```

### Recommendations

```text
GET /api/recommend/:name/:method
```

ตัวอย่าง:

```text
GET /api/recommend/admin/personalized
GET /api/recommend/admin/collaborative
GET /api/recommend/admin/genre
GET /api/recommend/admin/popular
```

## Demo Data

สามารถเพิ่มข้อมูลตัวอย่างผ่านปุ่มในหน้าเว็บ หรือเรียก API เหล่านี้:

```text
POST /api/users/sample
POST /api/movies/sample
POST /api/relationships/sample
```

## Troubleshooting

### Login แล้วขึ้น `Failed to fetch`

ให้ตรวจสอบว่า:

- server ทำงานอยู่ที่ `http://localhost:4000`
- Neo4j เปิดอยู่
- ค่า `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` ใน `.env` ถูกต้อง
- เปิด `http://localhost:4000/api/health` แล้วได้ response ปกติ

### Server เปิดได้ แต่เพิ่ม/อ่านข้อมูลไม่ได้

โดยทั่วไปเกิดจากการเชื่อมต่อ Neo4j ไม่สำเร็จ ให้ตรวจสอบ:

- Neo4j container หรือ Neo4j service ทำงานอยู่
- password ตรงกับ `NEO4J_PASSWORD`
- database name ตรงกับ `NEO4J_DATABASE`

### ใช้ Docker แล้ว app ต่อ Neo4j ไม่ได้

ใน Docker Compose ตัว app ใช้ค่า:

```env
NEO4J_URI=bolt://neo4j:7687
```

ไม่ใช่ `bolt://localhost:7687` เพราะ app container ต้องเรียก Neo4j ผ่านชื่อ service ใน Compose network

## License

MIT
