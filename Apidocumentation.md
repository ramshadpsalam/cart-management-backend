POST /api/auth/create-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newadmin@test.com",
  "password": "password123",
  "name": "New Admin"
}

Response:
{
  "message": "Admin created successfully",
  "user": {
    "id": 3,
    "email": "newadmin@test.com",
    "name": "New Admin",
    "role": "admin"
  }
}



GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "superadmin@test.com",
  "name": "Super Admin",
  "role": "superadmin",
  "created_at": "2024-01-01T00:00:00.000Z"
}



GET /api/products/:id
Authorization: Bearer <token>



POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "stock": 50,
  "image_url": "https://via.placeholder.com/150"
}

Response:
{
  "message": "Product created successfully",
  "product": { ... }
}




PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 39.99,
  "stock": 45,
  "image_url": "https://via.placeholder.com/150"
}

DELETE /api/products/:id
Authorization: Bearer <token>

Response:
{
  "message": "Product deleted successfully"
}
