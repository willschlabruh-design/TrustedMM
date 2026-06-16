-- Grant persistent admin role to platform owner
UPDATE "User"
SET role = 'ADMIN'
WHERE LOWER(username) = 'willschla'
   OR LOWER(email) = 'william.schlanbusch@gmail.com';
