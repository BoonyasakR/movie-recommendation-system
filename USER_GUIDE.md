# คู่มือใช้งาน Movie Recommendation System

ไฟล์นี้สรุปวิธีใช้งานระบบแนะนำภาพยนตร์ รวมถึงตัวอย่างคำสั่ง Neo4j Cypher สำหรับดูข้อมูล ทำ CRUD และตรวจสอบความสัมพันธ์ใน graph

## 1. เปิดระบบ

ติดตั้ง dependencies ก่อนใช้งานครั้งแรก:

```bash
npm install
```

รัน server:

```bash
npm start
```

เปิดเว็บ:

```text
http://localhost:4000/login.html
```

ถ้าใช้ Docker Compose:

```bash
docker compose up -d --build
```

เปิดเว็บ:

```text
App:           http://localhost:4000/login.html
Neo4j Browser: http://localhost:7474
```

## 2. Login

บัญชีเริ่มต้น:

```text
Username: admin
Password: admin123
```

ถ้าแก้ค่า `DEFAULT_ADMIN_NAME` หรือ `DEFAULT_ADMIN_PASSWORD` ใน `.env` ให้ใช้ค่าที่ตั้งไว้แทน

## 3. หน้าเว็บหลัก

- `login.html` - เข้าสู่ระบบ
- `signup.html` - สมัครสมาชิก
- `index.html` - เลือกหนังที่ดูแล้วหรือชอบ
- `users.html` - จัดการผู้ใช้
- `movies.html` - จัดการหนังและ relationship
- `recommend.html` - ดูหนังที่ระบบแนะนำ
- `admin.html` - หน้า admin รวมข้อมูลหลัก

## 4. ลำดับการทดลองใช้งาน

1. เข้า `login.html`
2. Login ด้วย `admin` / `admin123`
3. ไปหน้า `users.html` แล้วเพิ่ม user หรือกดเพิ่มข้อมูลตัวอย่าง
4. ไปหน้า `movies.html` แล้วเพิ่ม movie หรือกดเพิ่มข้อมูลตัวอย่าง
5. เพิ่ม relationship เช่น `WATCHED` หรือ `LIKED` ระหว่าง user กับ movie
6. ไปหน้า `recommend.html`
7. เลือก user และเลือกวิธี recommendation
8. ดูผลลัพธ์หนังที่ระบบแนะนำ

## 5. Recommendation Modes

- `personalized` - แนะนำจากหนังที่ user เคย `WATCHED` หรือ `LIKED`
- `collaborative` - แนะนำจาก user คนอื่นที่ชอบหนังคล้ายกัน
- `genre` - แนะนำจาก genre ของหนังที่ user ชอบ
- `popular` - แนะนำจากหนังที่มีความนิยมรวมสูง

## 6. เปิด Neo4j Browser

ถ้ารัน Neo4j ในเครื่องหรือ Docker Compose ให้เปิด:

```text
http://localhost:7474
```

ค่า login ปกติของโปรเจกต์:

```text
Username: neo4j
Password: 12345678
```

หลังเข้า Neo4j Browser แล้ว สามารถรันคำสั่ง Cypher ด้านล่างได้

## 7. Cypher CRUD สำหรับ User

สร้าง user:

```cypher
CREATE (u:User {
  name: "Alice",
  age: 20,
  role: "user"
})
RETURN u;
```

ดู user ทั้งหมด:

```cypher
MATCH (u:User)
RETURN u;
```

ค้นหา user ตามชื่อ:

```cypher
MATCH (u:User {name: "Alice"})
RETURN u;
```

แก้ไข user:

```cypher
MATCH (u:User {name: "Alice"})
SET u.age = 21
RETURN u;
```

ลบ user พร้อม relationship:

```cypher
MATCH (u:User {name: "Alice"})
DETACH DELETE u;
```

## 8. Cypher CRUD สำหรับ Movie

สร้าง movie:

```cypher
CREATE (m:Movie {
  title: "Inception",
  genre: "Sci-Fi",
  year: 2010,
  description: "A movie about dreams within dreams"
})
RETURN m;
```

ดู movie ทั้งหมด:

```cypher
MATCH (m:Movie)
RETURN m;
```

ค้นหา movie ตามชื่อ:

```cypher
MATCH (m:Movie {title: "Inception"})
RETURN m;
```

แก้ไข movie:

```cypher
MATCH (m:Movie {title: "Inception"})
SET m.genre = "Science Fiction",
    m.year = 2010
RETURN m;
```

ลบ movie พร้อม relationship:

```cypher
MATCH (m:Movie {title: "Inception"})
DETACH DELETE m;
```

## 9. Cypher สำหรับ Relationship

สร้าง relationship `WATCHED`:

```cypher
MATCH (u:User {name: "Alice"})
MATCH (m:Movie {title: "Inception"})
MERGE (u)-[r:WATCHED]->(m)
RETURN u, r, m;
```

สร้าง relationship `LIKED`:

```cypher
MATCH (u:User {name: "Alice"})
MATCH (m:Movie {title: "Inception"})
MERGE (u)-[r:LIKED]->(m)
RETURN u, r, m;
```

ดู relationship ทั้งหมดแบบ graph:

```cypher
MATCH p=(u:User)-[r]->(m:Movie)
RETURN p;
```

ดู relationship ทั้งหมดแบบตาราง:

```cypher
MATCH (u:User)-[r]->(m:Movie)
RETURN u.name AS user,
       type(r) AS relationship,
       m.title AS movie,
       m.genre AS genre,
       m.year AS year;
```

ดูเฉพาะหนังที่ user เคยดู:

```cypher
MATCH (u:User {name: "Alice"})-[r:WATCHED]->(m:Movie)
RETURN u.name AS user, type(r) AS relationship, m.title AS movie;
```

ดูเฉพาะหนังที่ user ชอบ:

```cypher
MATCH (u:User {name: "Alice"})-[r:LIKED]->(m:Movie)
RETURN u.name AS user, type(r) AS relationship, m.title AS movie;
```

นับจำนวน relationship แต่ละประเภท:

```cypher
MATCH ()-[r]->()
RETURN type(r) AS relationship_type, count(r) AS total
ORDER BY total DESC;
```

ลบ relationship เฉพาะเส้น:

```cypher
MATCH (u:User {name: "Alice"})-[r:WATCHED]->(m:Movie {title: "Inception"})
DELETE r;
```

## 10. Query สำหรับ Recommendation

แนะนำจาก genre ที่ user ชอบ:

```cypher
MATCH (u:User {name: "Alice"})-[:LIKED]->(liked:Movie)
MATCH (rec:Movie {genre: liked.genre})
WHERE NOT (u)-[:WATCHED|LIKED]->(rec)
RETURN rec.title AS title,
       rec.genre AS genre,
       rec.year AS year,
       count(*) AS score
ORDER BY score DESC
LIMIT 10;
```

แนะนำจาก user ที่ชอบหนังคล้ายกัน:

```cypher
MATCH (u:User {name: "Alice"})-[:LIKED]->(m:Movie)<-[:LIKED]-(other:User)
MATCH (other)-[:LIKED]->(rec:Movie)
WHERE NOT (u)-[:WATCHED|LIKED]->(rec)
RETURN rec.title AS title,
       rec.genre AS genre,
       rec.year AS year,
       count(*) AS score
ORDER BY score DESC
LIMIT 10;
```

ดูหนังยอดนิยมจากจำนวน relationship:

```cypher
MATCH (:User)-[r:WATCHED|LIKED]->(m:Movie)
RETURN m.title AS title,
       m.genre AS genre,
       count(r) AS score
ORDER BY score DESC
LIMIT 10;
```

## 11. API ที่ใช้บ่อย

ตรวจสอบ server:

```text
GET /api/health
```

สมัครสมาชิก:

```text
POST /api/auth/register
```

เข้าสู่ระบบ:

```text
POST /api/auth/login
```

ดู users:

```text
GET /api/users
```

ดู movies:

```text
GET /api/movies
```

ดู relationships:

```text
GET /api/relationships
```

ดู recommendation:

```text
GET /api/recommend/:name/:method
```

ตัวอย่าง:

```text
GET /api/recommend/Alice/personalized
GET /api/recommend/Alice/collaborative
GET /api/recommend/Alice/genre
GET /api/recommend/Alice/popular
```

## 12. ล้างข้อมูลทดลอง

ลบ relationship ทั้งหมด:

```cypher
MATCH ()-[r]->()
DELETE r;
```

ลบ movie ทั้งหมด:

```cypher
MATCH (m:Movie)
DETACH DELETE m;
```

ลบ user ทั้งหมด:

```cypher
MATCH (u:User)
DETACH DELETE u;
```

ลบข้อมูลทั้งหมดใน database:

```cypher
MATCH (n)
DETACH DELETE n;
```

ระวัง: คำสั่งสุดท้ายจะลบ node และ relationship ทั้งหมดใน database

## 13. ปัญหาที่พบบ่อย

ถ้า login แล้วขึ้น `Failed to fetch`:

- ตรวจสอบว่า server รันอยู่ที่ `http://localhost:4000`
- ตรวจสอบว่า Neo4j เปิดอยู่
- ตรวจสอบค่า `.env`
- ลองเปิด `http://localhost:4000/api/health`

ถ้า query ไม่เจอข้อมูล:

- ตรวจสอบ label ว่าใช้ `User` และ `Movie`
- ตรวจสอบชื่อ property เช่น `name`, `title`, `genre`, `year`
- ตรวจสอบว่ามี relationship แล้วหรือยังด้วยคำสั่ง:

```cypher
MATCH p=(u:User)-[r]->(m:Movie)
RETURN p;
```
