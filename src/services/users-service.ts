import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

export async function registerUserService(dto: RegisterUserDto) {
  // Check if user with given email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, dto.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password using Bun's native bcrypt password hashing
  const hashedPassword = await Bun.password.hash(dto.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert new user into database
  await db.insert(users).values({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
  });

  return { data: "OK" };
}
